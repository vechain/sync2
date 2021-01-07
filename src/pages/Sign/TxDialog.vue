<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column no-wrap">
            <page-toolbar
                title="Transaction"
                icon="close"
                :gid="gid"
                @action="hide()"
            />
            <page-content
                class="col q-pa-sm bg-grey-3"
                innerClass="q-gutter-y-sm"
            >
                <clause-card
                    v-for="(c, i) in req.message"
                    :key="i"
                    :index="i"
                    :clause="c"
                    :tokens="tokens"
                    @click="onClickClause(i, c)"
                />
            </page-content>
            <page-content size="xs">
                <error-tip
                    v-if="criticalError"
                    :error="criticalError"
                />
                <template v-else>
                    <error-tip
                        v-if="warnings.length > 0"
                        type="warning"
                        :error="{name: 'Transaction may fail/revert'}"
                        clickable
                        @click="showWarnings()"
                    />

                    <gas-fee-bar :fee="fee">
                        <priority-selector
                            v-model="gasPriceCoef"
                            :calcFee="calcFee"
                        />
                    </gas-fee-bar>
                    <signer-selector
                        :signer="signer"
                        :groups="signerGroups"
                        @select="signer=$event"
                    />
                </template>
            </page-content>
            <page-action class="q-mt-md">
                <q-btn
                    v-if="criticalError"
                    outline
                    color="primary"
                    :label="$t('common.close')"
                    @click="hide()"
                />
                <q-btn
                    v-else
                    unelevated
                    color="primary"
                    :label="$t('sign.action_sign')"
                    @click="onClickSign()"
                    :loading="thor.status.head.number === 0"
                />
            </page-action>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Common from './Common'
import { QDialog } from 'quasar'
import PageToolbar from 'src/components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'
import SignerSelector from './SignerSelector.vue'
import { estimateGas, EstimateGasResult, calcFee, decodeAsTokenTransferClause } from './helper'
import PrioritySelector from './PrioritySelector.vue'
import GasFeeBar from './GasFeeBar.vue'
import ClauseCard from './ClauseCard'
import { Transaction, secp256k1 } from 'thor-devkit'
import { BigNumber } from 'bignumber.js'
import { randomBytes } from 'crypto'
import { Vault } from 'src/core/vault'
import ErrorTip from './ErrorTip.vue'
import WarningListDialog from './WarningListDialog.vue'
import InspectClauseDialog from './InspectClauseDialog.vue'

export default Common.extend({
    components: { PageToolbar, PageContent, PageAction, SignerSelector, PrioritySelector, GasFeeBar, ClauseCard, ErrorTip },
    props: {
        req: Object as () => M.TxRequest
    },
    data() {
        return {
            gasPriceCoef: 0
        }
    },
    computed: {
        calcFee() {
            const est = this.estimation
            if (!est) {
                return null
            }
            return (coef: number) => {
                return calcFee(est.gas, est.baseGasPrice, coef).toString()
            }
        },
        fee(): string | null {
            return this.calcFee ? this.calcFee(this.gasPriceCoef) : null
        },
        criticalError(): Error | null {
            if (!this.wallet) {
                return { name: 'Critical Error', message: this.signerGroups.length > 0 ? 'Required address not owned' : 'No wallet available' }
            }
            // test vip191 feature bit when delegator set
            const head = this.thor.status.head
            if (head.number > 0 && this.req.options.delegator && ((head.txsFeatures || 0) & 1)) {
                return { name: 'Critical Error', message: 'VIP191 feature is not supported' }
            }
            return null
        },
        warnings(): Error[] {
            const ret: Error[] = []
            if (this.estimation) {
                const { reverted, vmError, revertReason } = this.estimation
                if (reverted) {
                    ret.push({
                        name: 'VM error',
                        message: `${vmError} ${revertReason}`
                    })
                }
            }
            this.energyWarning && ret.push(this.energyWarning)
            return ret
        },
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor }
    },
    asyncComputed: {
        estimation(): Promise<EstimateGasResult | null> {
            if (!this.wallet) {
                return Promise.resolve(null)
            }
            return estimateGas(
                this.thor,
                this.req.message,
                this.req.options.gas || 0,
                this.signer,
                this.req.options.delegator && this.req.options.delegator.signer)
        },
        tokens: {
            async get(): Promise<M.TokenSpec[]> {
                const all = await this.$svc.config.token.all()
                return all.filter(spec => spec.gid === this.gid)
            },
            default: []
        },
        async energyWarning(): Promise<Error | null> {
            const est = this.estimation
            const fee = this.fee
            if (!est || !fee) {
                return null
            }
            const signer = this.signer
            const gasPayer = (this.req.options.delegator && this.req.options.delegator.signer) || signer
            const acc = await this.thor.account(gasPayer).get()

            let energyBalance = new BigNumber(acc.energy)

            if (gasPayer === signer) {
                // in the case signer is the gas payer, we deduct the balance with VTHO out amount
                const vthoSpec = this.tokens.find(t => t.symbol === 'VTHO')
                if (vthoSpec) {
                    for (const c of this.req.message) {
                        const r = decodeAsTokenTransferClause(c, vthoSpec)
                        if (r) {
                            energyBalance = energyBalance.minus(r.amount)
                        }
                    }
                }
            }
            if (energyBalance.isLessThan(fee)) {
                return { name: this.$t('sign.label_insufficient_energy').toString(), message: this.$t('sign.msg_insufficient_energy').toString() }
            }
            return null
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },

        ok(result: M.TxResponse) {
            this.$emit('ok', result)
            this.hide()
        },
        showWarnings() {
            this.$dialog({
                component: WarningListDialog,
                warnings: this.warnings,
                noAction: true
            })
        },
        async onClickSign() {
            const est = this.estimation
            const wallet = this.wallet
            const signer = this.signer

            if (!est || !wallet) {
                return
            }

            if (est.reverted) {
                await this.$dialog({
                    component: WarningListDialog,
                    title: this.$t('sign.label_transaction_warning').toString(),
                    warnings: this.warnings
                })
            }

            const password = await this.$authenticate()

            // compose the tx body
            const txBody: Transaction.Body = {
                chainTag: Number.parseInt(this.thor.genesis.id.slice(-2), 16),
                blockRef: this.thor.status.head.id.slice(0, 18),
                expiration: 18, // about 3 mins
                clauses: this.req.message.map(item => {
                    return {
                        to: item.to,
                        value: '0x' + new BigNumber(item.value).toString(16),
                        data: item.data || '0x'
                    }
                }),
                gasPriceCoef: this.gasPriceCoef,
                gas: est.gas,
                dependsOn: this.req.options.dependsOn || null,
                nonce: '0x' + randomBytes(8).toString('hex')
            }

            const delegator = this.req.options.delegator
            const tx = await this.$loading(async () => {
                let tx
                let delegatorSig
                if (delegator) {
                    tx = new Transaction({ ...txBody, reserved: { features: 1 /* VIP191 bit */ } })
                    try {
                        const resp = await this.$axios.post(delegator.url, {
                            raw: '0x' + tx.encode().toString('hex'),
                            origin: signer
                        }, { transformResponse: data => JSON.parse(data), headers: { 'content-type': 'application/json' } })
                        delegatorSig = Buffer.from(resp.data.signature.slice(2), 'hex')
                    } catch (err) {
                        this.$q.notify({
                            type: 'negative',
                            message: this.$t('sign.msg_delegation_failed').toString()
                        })
                        // rethrow to end the process
                        throw err
                    }
                } else {
                    tx = new Transaction(txBody)
                }

                const vault = await Vault.decode(wallet.vault)
                const node = await vault.derive(wallet.meta.addresses.indexOf(signer))
                const sk = await node.unlock(password)

                const originSig = secp256k1.sign(tx.signingHash(), sk)
                tx.signature = delegatorSig ? Buffer.concat([originSig, delegatorSig]) : originSig
                return tx
            })

            const encoded = '0x' + tx.encode().toString('hex')
            this.$svc.bc(this.gid).commitTx(encoded)

            this.$svc.activity.add({
                gid: this.gid,
                walletId: wallet.id,
                createdTime: Date.now(),
                status: '',
                type: 'tx',
                glob: {
                    id: tx.id!,
                    encoded,
                    signer,
                    comment: this.req.options.comment || '',
                    receipt: null,
                    origin: this.req.origin || '',
                    link: this.req.options.link || ''
                }
            })

            this.ok({
                txid: tx.id!,
                signer
            })
        },
        onClickClause(index: number, clause: Connex.Vendor.TxMessage[0]) {
            this.$q.dialog({
                parent: this,
                component: InspectClauseDialog,
                index,
                clause
            })
        }
    }
})
</script>
