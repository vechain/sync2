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
                :title="$t('common.transaction')"
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
                        :error="{name: this.$t('sign.label_transaction_warning')}"
                        clickable
                        @click="showWarnings()"
                    />

                    <gas-fee-bar :fee="fee" :isDelegation="isDelegation">
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
import { Transaction } from 'thor-devkit'
import { BigNumber } from 'bignumber.js'
import { randomBytes } from 'crypto'
import ErrorTip from './ErrorTip.vue'
import WarningListDialog from './WarningListDialog.vue'
import InspectClauseDialog from './InspectClauseDialog.vue'
import Contract from '../MultiSig/const'

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
                return { name: this.$t('sign.label_critical_error').toString(), message: this.signerGroups.length > 0 ? this.$t('sign.msg_address_not_owned').toString() : this.$t('common.no_wallet').toString() }
            }
            // test vip191 feature bit when delegator set
            const head = this.thor.status.head
            if (head.number > 0 && this.req.options.delegator && !((head.txsFeatures || 0) & 1)) {
                return { name: this.$t('sign.label_critical_error').toString(), message: this.$t('sign.msg_vip191_not_supported').toString() }
            }
            return null
        },
        warnings(): Error[] {
            const ret: Error[] = []
            if (this.estimation) {
                const { reverted, vmError, revertReason } = this.estimation
                if (reverted) {
                    ret.push({
                        name: this.$t('sign.label_vm_error').toString(),
                        message: revertReason ? `${vmError} (${revertReason})` : `${vmError}`
                    })
                }
            }
            this.energyWarning && ret.push(this.energyWarning)
            return ret
        },
        isDelegation(): boolean {
            return !!this.req.options.delegator
        },
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor },
        estimation(): EstimateGasResult | null {
            if (this.delayedEstimation && (this.delayedEstimation.caller === (this.isMultiSig ? this.multiSigOwner.signer : this.signer))) {
                return this.delayedEstimation
            }
            return null
        },
        isMultiSig(): boolean {
            return !!(this.wallet && this.wallet.meta.type === 'multisig')
        }
    },
    asyncComputed: {
        // the result may not match the current signer
        delayedEstimation(): Promise<EstimateGasResult | null> {
            if (!this.wallet || (this.isMultiSig && !this.multiSigOwner.wallet)) {
                return Promise.resolve(null)
            }

            return estimateGas(
                this.thor,
                this.isMultiSig ? this.multiSigClauses(this.req.message) : this.req.message,
                this.req.options.gas || 0,
                this.isMultiSig ? this.multiSigOwner.signer : this.signer,
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
            if (!est || !fee || (this.req.options.delegator && !this.req.options.delegator.signer)) {
                return null
            }
            const signer = this.isMultiSig ? this.multiSigOwner.signer : this.signer
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
                return { name: this.$t('sign.label_insufficient_vtho').toString(), message: this.$t('sign.msg_insufficient_vtho').toString() }
            }
            return null
        },
        async multiSigOwner(): Promise<{wallet: M.Wallet | null, signer: string}> {
            if (!this.wallet) {
                return { wallet: this.wallet, signer: this.signer }
            }

            const { decoded: { 0: owners } } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(Contract.getOwners)
                .call()

            const wallets = await this.$svc.wallet.getByGid(this.wallet.gid)
            for (const wallet of wallets) {
                for (const signer of wallet.meta.addresses) {
                    if (owners.includes(signer)) {
                        return { wallet, signer }
                    }
                }
            }

            return { wallet: this.wallet, signer: this.signer }
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
            this.$q.dialog({
                component: WarningListDialog,
                parent: this,
                warnings: this.warnings,
                noAction: true
            })
        },
        multiSigClauses(clauses: Connex.VM.Clause[]): Transaction.Clause[] {
            if (!this.wallet) {
                return clauses as Transaction.Clause[]
            }
            return clauses.map(({ to, value = 0, data = '0x' }) => {
                const hexValue = '0x' + new BigNumber(value).toString(16)
                return {
                    to: this.wallet!.meta.addresses[0],
                    value: 0,
                    data: this.thor.account(this.wallet!.meta.addresses[0])
                        .method(Contract.submitTransaction)
                        .asClause(to || '0x0000000000000000000000000000000000000000', hexValue, data)
                        .data
                }
            })
        },
        async onClickSign() {
            const est = this.estimation
            const wallet = this.isMultiSig ? this.multiSigOwner.wallet : this.wallet
            const signer = this.isMultiSig ? this.multiSigOwner.signer : this.signer

            if (!est || !wallet) {
                return
            }

            // @TODO: favo: estimate based on multi-sig interaction
            if (est.reverted) {
                await this.$dialog({
                    component: WarningListDialog,
                    title: this.$t('sign.label_transaction_warning').toString(),
                    warnings: this.warnings
                })
            }

            let tx!: Transaction
            let delegatorSig: Buffer | undefined

            const clauses = this.req.message.map(item => ({
                to: item.to,
                value: '0x' + new BigNumber(item.value).toString(16),
                data: item.data || '0x'
            }))

            const originSig = await this.signTx(wallet, signer, () => {
                // compose the tx body
                const txBody: Transaction.Body = {
                    chainTag: Number.parseInt(this.thor.genesis.id.slice(-2), 16),
                    blockRef: this.thor.status.head.id.slice(0, 18),
                    expiration: 18, // about 3 mins
                    clauses: this.isMultiSig ? this.multiSigClauses(clauses) : clauses,
                    gasPriceCoef: this.gasPriceCoef,
                    gas: est.gas,
                    dependsOn: this.req.options.dependsOn || null,
                    nonce: '0x' + randomBytes(8).toString('hex')
                }

                return this.$loading(async () => {
                    const delegator = this.req.options.delegator
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
                    return tx
                })
            })

            tx.signature = delegatorSig ? Buffer.concat([originSig, delegatorSig]) : originSig

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
