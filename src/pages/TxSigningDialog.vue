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
            <q-toolbar>
                <q-toolbar-title class="absolute-center">
                    Sign
                </q-toolbar-title>
                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click="hide"
                />
            </q-toolbar>
            <!-- clause list -->
            <q-card-section
                v-scrollDivider.both
                class="overflow-auto col no-wrap"
            >
                <q-banner
                    rounded
                    v-if="estGasError"
                    class="bg-red text-white q-mb-sm"
                >{{estGasError.message}}</q-banner>
                <q-banner
                    rounded
                    v-if="vmError"
                    class="bg-orange text-white q-mb-sm"
                >{{vmError.message}}</q-banner>

                <ClauseCard
                    class="column q-mb-md"
                    v-for="(msg, i) in req.message"
                    :key="i"
                    :tokens="[ tokenSpecs.VTHO, ...tokens]"
                    :msg="msg"
                >
                    {{ `Clause #${i+1}`}}
                </ClauseCard>
            </q-card-section>
            <!-- signer infos -->
            <q-card-actions
                class="bg-grey-2 shadow-up-1 q-mt-auto"
                style="z-index: 2"
            >
                <template v-if="!signing">
                    <div
                        v-if="(isEnforced && !hasTheSigner) || !wallets.length"
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
                    <ConnexObject
                        v-else
                        v-slot="{connex}"
                        :node="node"
                    >
                        <ConnexContinuous
                            :connex="connex"
                            :query="estGas(connex)"
                            @data="estimateHandler"
                            @error="(e) => { estGasError = e }"
                            v-slot="{data: estGas}"
                        >
                            <q-list class="full-width">
                                <Priority
                                    :gas="estGas && estGas.gas"
                                    :bgp="estGas && estGas.baseGasPrice"
                                    v-model="gasPriceCoef"
                                />
                                <AccountSelector
                                    v-model="signer"
                                    :wallets="wallets"
                                    :connex="connex"
                                    v-slot="{address}"
                                    :isSelectable="!isEnforced"
                                >
                                    <BalanceList
                                        :connex="connex"
                                        :address="address"
                                        :tokens="tokens"
                                    />
                                </AccountSelector>
                                <q-item class="q-my-lg justify-center">
                                    <q-btn
                                        :disabled="!estGas"
                                        unelevated
                                        class="col-6 col-sm-auto"
                                        color="blue-9"
                                        label="Sign"
                                        @click="signTx(connex, estGas)"
                                    />
                                </q-item>
                            </q-list>
                        </ConnexContinuous>
                    </ConnexObject>
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
import { tokenSpecs } from '../consts'
import { estimateGas, EstimateGasResult, buildTx } from '../utils/tx'
import { Vault } from 'core/vault'

export default Vue.extend({
    props: {
        req: Object as () => M.TxRequest,
        gid: String,
        referer: Object as () => M.Referer
    },
    data() {
        return {
            signer: '',
            tokenSpecs,
            gasPriceCoef: 0,
            estGasError: null as Error | null,
            vmError: null as Error | null,
            signing: false
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
        node(): M.Node | undefined {
            return this.$state.config.node.list.find(item => {
                return item.gid === this.gid
            })
        },
        tokens(): M.TokenSpec[] {
            return this.$state.config.token.specs(this.gid, true)
        },
        isEnforced(): boolean {
            return !!(this.req.options && this.req.options.signer)
        },
        hasTheSigner(): boolean {
            return this.isEnforced && this.addresses.includes(this.req.options!.signer!)
        },
        addresses(): string[] {
            let addrList: string[] = []
            this.wallets.forEach(wallet => {
                addrList = [...addrList, ...wallet.meta.addresses]
            })
            return addrList
        },
        wallets(): M.Wallet[] {
            return this.$state.wallet.list.filter(item => {
                return item.gid === this.gid
            })
        },
        wallet(): M.Wallet | null {
            return this.wallets.find((item: M.Wallet) => {
                return item.meta.addresses.includes(this.signer)
            }) || null
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        estimateHandler(data: EstimateGasResult) {
            this.estGasError = null
            if (data.reverted) {
                this.vmError = new Error(data.vmError)
            } else {
                this.vmError = null
            }
        },
        estGas(connex: Connex) {
            return async () => {
                if (this.signer && connex) {
                    return await estimateGas(connex, this.clauseList, this.suggettedGas, this.signer)
                } else {
                    return null
                }
            }
        },
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
            } else {
                this.signer = this.wallets[0].meta.addresses[0]
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
        async signTx(connex: Connex, estGas: EstimateGasResult) {
            const clauses: Connex.Thor.Transaction['clauses'] = this.clauseList.map(item => {
                return {
                    to: item.to,
                    value: '0x' + new BigNumber(item.value).toString(16),
                    data: item.data || '0x'
                }
            })
            const builtTx = buildTx(
                connex,
                clauses,
                this.gasPriceCoef,
                estGas.gas,
                (this.req.options && this.req.options.dependsOn) || null
            )
            try {
                const pin = await this.$authenticate(pin => Promise.resolve(pin))
                this.signing = true
                if (this.wallet) {
                    const vault = await Vault.decode(this.wallet.vault)
                    const node = await vault.derive(this.wallet.meta.addresses.indexOf(this.signer))
                    const pk = await node.unlock(pin)
                    const st = builtTx.signTx(pk)
                    const raw = '0x' + st.encode().toString('hex')
                    this.$txer.request(
                        st.id!,
                        `${this.node!.url}/transactions`,
                        raw
                    )

                    const glob: M.Activity.Tx = {
                        id: st.id!,
                        type: 'tx',
                        finished: false,
                        comment: (this.req.options && this.req.options.comment) || '',
                        message: this.req.message,
                        signer: this.signer,
                        timestamp: connex.thor.status.head.timestamp,
                        estimatedFee: this.getFee(estGas.gas, estGas.baseGasPrice, this.gasPriceCoef),
                        referer: this.referer || {},
                        raw: raw,
                        receipt: null
                    }

                    this.$storage.activities.insert({
                        gid: this.gid,
                        walletId: this.wallet.id,
                        createdTime: Date.now(),
                        status: '',
                        glob: JSON.stringify(glob)
                    })

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
