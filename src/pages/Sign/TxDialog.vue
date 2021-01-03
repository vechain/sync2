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
                />
            </page-content>
            <page-content innerClass="q-pa-xs q-gutter-y-xs">
                <alert-tip
                    v-for="(a, i) in alerts"
                    :key="i"
                    :alert="a"
                />
            </page-content>
            <page-content size="xs">
                <gas-fee-bar :fee="fee">
                    <priority-selector
                        v-model="gasPriceCoef"
                        :calcFee="calcFee"
                    />
                </gas-fee-bar>
                <signer-selector
                    v-if="wallet"
                    :signer="signer"
                    :groups="signerGroups"
                    @select="signer=$event"
                />
            </page-content>
            <page-action class="q-mt-md">
                <q-btn
                    v-if="wallet"
                    unelevated
                    color="primary"
                    label="Sign"
                    @click="onClickSign()"
                />
                <q-btn
                    v-else
                    outline
                    color="primary"
                    label="Close"
                    @click="hide()"
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
import { estimateGas, EstimateGasResult, calcFee } from './helper'
import PrioritySelector from './PrioritySelector.vue'
import GasFeeBar from './GasFeeBar.vue'
import ClauseCard from './ClauseCard'
import AlertTip, { Alert } from './AlertTip.vue'
import { Transaction, secp256k1, blake2b256 } from 'thor-devkit'
import { BigNumber } from 'bignumber.js'
import { randomBytes } from 'crypto'
import { Vault } from 'src/core/vault'

export default Common.extend({
    components: { PageToolbar, PageContent, PageAction, SignerSelector, PrioritySelector, GasFeeBar, ClauseCard, AlertTip },
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
        alerts(): Alert[] {
            const ret: Alert[] = []
            if (this.signerError) {
                ret.push({
                    type: 'error',
                    message: this.signerError
                })
            }
            if (this.estimation) {
                const { reverted, vmError, revertReason } = this.estimation
                if (reverted) {
                    ret.push({
                        type: 'warn',
                        caption: 'Transaction may fail/revert',
                        message: `VM error: ${vmError}`,
                        extra: revertReason
                    })
                }
            }
            // TODO: insufficient energy
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
        async onClickSign() {
            if (!this.estimation) {
                return
            }

            const { reverted, gas } = this.estimation
            if (reverted) {
                await new Promise((resolve, reject) => {
                    this.$q.dialog({
                        title: 'Confirm',
                        message: 'Transaction may fail/revert',
                        cancel: true,
                        persistent: true
                    }).onOk(() => resolve())
                        .onCancel(() => reject())
                })
            }

            const wallet = this.wallet
            if (!wallet) {
                return
            }
            const signer = this.signer
            const password = await this.$authenticate()

            const clauses: Transaction.Clause[] = this.req.message.map(item => {
                return {
                    to: item.to,
                    value: '0x' + new BigNumber(item.value).toString(16),
                    data: item.data || '0x'
                }
            })

            const txBody: Transaction.Body = {
                chainTag: Number.parseInt(this.thor.genesis.id.slice(-2), 16),
                blockRef: this.thor.status.head.id.slice(0, 18),
                expiration: 18, // about 3 mins
                clauses,
                gasPriceCoef: this.gasPriceCoef,
                gas,
                dependsOn: this.req.options.dependsOn || null,
                nonce: '0x' + randomBytes(8).toString('hex')
            }

            const tx = new Transaction(txBody)

            tx.signature = await this.$loading(async () => {
                const vault = await Vault.decode(wallet.vault)
                const node = await vault.derive(wallet.meta.addresses.indexOf(signer))
                const sk = await node.unlock(password)

                return secp256k1.sign(blake2b256(tx.encode()), sk)
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

            // TODO vip191

            // let delegator = this.req.options.delegator
            // for (; ;) {
            //     let tx: Transaction
            //     if (delegator) {
            //         tx = new Transaction({ ...txBody, reserved: { features: 1 /* VIP191 bit */ } })
            //   //this.$axios.post(delegator.url,
            //     } else {
            //         tx = new Transaction({ ...txBody })
            //     }

            //     await this.$loading(async () => {
            //         const vault = await Vault.decode(wallet.vault)
            //         const node = await vault.derive(wallet.meta.addresses.indexOf(signer))
            //         const sk = await node.unlock(password)

            //         tx.signature = secp256k1.sign(blake2b256(tx.encode()), sk)
            //     })

            //     const encoded = '0x' + tx.encode().toString('hex')
            //     this.$svc.bc(this.gid).commitTx(encoded)
            //     break
            // }
        }
    }
})
</script>
