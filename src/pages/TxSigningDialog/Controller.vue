<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="fit column no-wrap">
            <page-toolbar
                title="Sign"
                icon="close"
                :gid="gid"
                @action="hide()"
            />
            <q-card-section
                v-scrollDivider.both
                v-if="tokenList.length"
                class="overflow-auto col no-wrap bg-grey-2"
            >
                <q-banner
                    rounded
                    v-if="$asyncComputed.estGas.exception"
                    class="bg-red text-white q-mb-sm"
                >{{$asyncComputed.estGas.exception.message}}</q-banner>
                <q-banner
                    rounded
                    v-if="estGas.result && estGas.result.vmError"
                    class="bg-orange text-white q-mb-sm"
                >{{estGas.result.vmError}}</q-banner>

                <ClauseCard
                    class="column q-mb-md"
                    v-for="(msg, i) in req.message"
                    :key="i"
                    :tokens="tokenList"
                    :msg="msg"
                >
                    {{ `Clause #${i+1}`}}
                </ClauseCard>
            </q-card-section>
            <q-card-actions
                class="shadow-up-1 q-mt-auto"
                style="z-index: 2"
            >
                <template v-if="!signing">
                    <div
                        v-if="!wallets.length"
                        class="column items-center q-mx-auto q-gutter-y-md"
                    >
                        <q-icon
                            name="error_outline"
                            class="text-red"
                            size="xl"
                        />
                        <span class="text-body1">Account doesn't exist</span>
                        <q-btn
                            label="Close"
                            class="q-px-lg"
                            color="primary"
                            @click="hide"
                        />
                    </div>
                    <q-list class="full-width">
                        <Priority
                            :gas="estGas.result && estGas.result.gas"
                            :bgp="estGas.result && estGas.result.baseGasPrice"
                            :loading="($asyncComputed.estGas.updating && !estGas.result) || (estGas.signer !== signer)"
                            v-model="gasPriceCoef"
                        />
                        <AccountSelector
                            v-if="wallets.length"
                            v-model="signer"
                            :wallets="wallets"
                            v-slot="{address}"
                            :isSelectable="true"
                        >
                            <q-list>
                                <template v-for="token in tokenList">
                                    <Resolve
                                        :key="token.symbol"
                                        :promise="$svc.bc(token.gid).balanceOf(address, token)"
                                        v-slot="{data}"
                                    >
                                        <TokenBalanceItem
                                            :balance="data"
                                            :token="token"
                                        />
                                    </Resolve>
                                </template>
                            </q-list>
                        </AccountSelector>
                        <q-item class="q-my-lg justify-center">
                            <q-btn
                                :disabled="!estGas.result"
                                unelevated
                                class="col-6 col-sm-auto"
                                color="blue-9"
                                label="Sign"
                                @click="signTx"
                            />
                        </q-item>
                    </q-list>
                </template>
                <template v-else>
                    <div class="text-center q-px-xl q-mx-auto">
                        <div class="q-my-xl">
                            <q-spinner-oval size="3.5em" />
                            <div class="text-body1 q-mt-sm">Signing approved content, one sec</div>
                        </div>
                    </div>
                </template>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import { QDialog } from 'quasar'
import Vue from 'vue'
import { BigNumber } from 'bignumber.js'
import { estimateGas, EstimateGasResult, buildTx } from './helper'
import { Vault } from 'core/vault'
import ClauseCard from './ClauseCard.vue'
import Priority from './Priority.vue'

export default Vue.extend({
    name: 'TxSigningDialog',
    components: {
        ClauseCard,
        Priority
    },
    props: {
        req: Object as () => M.TxRequest,
        gid: String
    },
    data() {
        return {
            signer: '',
            gasPriceCoef: 0,
            estGasError: null as Error | null,
            vmError: null as Error | null,
            signing: false
        }
    },
    asyncComputed: {
        wallets: {
            async get(): Promise<M.Wallet[]> {
                const all = await this.$svc.wallet.all()
                if (this.isEnforced) {
                    return all.filter((w: M.Wallet) => {
                        return w.gid === this.gid && w.meta.addresses.includes(this.req.options?.signer || '')
                    }).map((item: M.Wallet) => {
                        return {
                            ...item,
                            meta: {
                                ...item.meta,
                                addresses: [this.req.options && this.req.options.signer]
                            }
                        } as M.Wallet
                    })
                } else {
                    return all.filter(w => w.gid === this.gid)
                }
            },
            default: []
        },
        tokenList: {
            async get(): Promise<M.TokenSpec[]> {
                const [tokens, activeSymbols] = await Promise.all([
                    this.$svc.config.token.all(),
                    this.$svc.config.token.activeSymbols()
                ])
                return tokens.filter(token => token.gid === this.gid && (activeSymbols.includes(token.symbol) || token.permanent))
            },
            default: []
        },
        estGas: {
            async get(): Promise<{ result: EstimateGasResult | null, signer: string }> {
                if (this.signer) {
                    return {
                        result: await estimateGas(this.$svc.bc(this.gid).thor, this.clauseList, this.suggettedGas, this.signer),
                        signer: this.signer
                    }
                } else {
                    return {
                        result: null,
                        signer: ''
                    }
                }
            },
            default: {
                result: null,
                signer: ''
            }
        }
    },
    computed: {
        clauseList(): Connex.VM.Clause[] {
            return this.req.message.map((item: Connex.Vendor.TxMessage[0]) => {
                return {
                    to: item.to,
                    value: item.value,
                    data: item.data
                }
            })
        },
        suggettedGas(): number {
            return this.req.options ? this.req.options.gas || 0 : 0
        },
        isEnforced(): boolean {
            return !!(this.req.options && this.req.options.signer)
        },
        hasTheSigner(): boolean {
            return this.addresses.includes(this.req.options!.signer!)
        },
        addresses(): string[] {
            let addrList: string[] = []
            this.wallets.forEach(wallet => {
                addrList = [...addrList, ...wallet.meta.addresses]
            })
            return addrList
        },
        wallet(): M.Wallet | undefined {
            return this.wallets.find((item: M.Wallet) => {
                return item.meta.addresses.includes(this.signer)
            })
        }
    },
    mounted() {
        this.initData()
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
        initData() {
            if (this.isEnforced) {
                this.signer = this.hasTheSigner
                    ? this.req.options!.signer!
                    : ''
            }
        },
        getFee(gas: number, bgp: string, coef: number): string {
            if (gas > 0) {
                const gp = new BigNumber(bgp).times(coef).idiv(255).plus(bgp)
                return gp.times(gas).toString(10)
            }
            return new BigNumber(NaN).toString(10)
        },
        // build Tx
        async signTx() {
            const clauses: Connex.Thor.Transaction['clauses'] = this.clauseList.map(item => {
                return {
                    to: item.to,
                    value: '0x' + new BigNumber(item.value).toString(16),
                    data: item.data || '0x'
                }
            })
            const thor = this.$svc.bc(this.gid).thor
            const builtTx = buildTx(
                thor,
                clauses,
                this.gasPriceCoef,
                this.estGas.result!.gas,
                (this.req.options && this.req.options.dependsOn) || null
            )
            try {
                const pin = await this.$authenticate()
                this.signing = true
                if (this.wallet) {
                    const vault = await Vault.decode(this.wallet.vault)
                    const node = await vault.derive(this.wallet.meta.addresses.indexOf(this.signer))
                    const pk = await node.unlock(pin)
                    const st = builtTx.signTx(pk)
                    const raw = '0x' + st.encode().toString('hex')

                    const txGlob: M.Activity.TxGlob = {
                        id: st.id!,
                        encoded: raw,
                        signer: this.signer,
                        comment: this.req.options?.comment || '',
                        receipt: null
                    }
                    this.$svc.activity.add({
                        gid: this.gid,
                        walletId: this.wallet.id,
                        createdTime: Date.now(),
                        status: '',
                        type: 'tx',
                        glob: txGlob
                    })

                    // TODO TX Request

                    this.ok({
                        txid: st.id!,
                        signer: this.signer
                    })
                }
            } catch (error) {
                console.log(error)
            } finally {
                this.signing = false
            }
        }
    }
})
</script>
