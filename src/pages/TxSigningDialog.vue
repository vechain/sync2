<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <div class="fit">
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
                    v-scrollDivider
                    class="overflow-auto"
                    style="height: calc(100% - 202px)"
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
                    class="absolute-bottom bg-grey-2 shadow-up-1"
                    style="z-index: 2"
                >
                    <ConnexObject
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
                                    :isSelectable="isSelectable"
                                >
                                    <BalanceList
                                        :connex="connex"
                                        :address="address"
                                        :tokens="tokens"
                                    />
                                </AccountSelector>
                                <q-item>
                                    <SlideBtn
                                        v-model="signed"
                                        :disabled="!estGas"
                                        @checked="onChecked(connex, estGas)"
                                        label="Slide to Sign"
                                        style="width: 70%"
                                        class="absolute-center"
                                    />
                                </q-item>
                            </q-list>
                        </ConnexContinuous>
                    </ConnexObject>
                </q-card-actions>
            </div>
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
        gid: String
    },
    data() {
        return {
            signer: '',
            isSelectable: false,
            tokenSpecs,
            signed: false,
            gasPriceCoef: 0,
            estGasError: null as Error | null,
            vmError: null as Error | null
        }
    },
    computed: {
        clauseList(): Connex.Thor.Clause[] {
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
    created() {
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
            if (!this.hasTheSigner()) {
                // TODO return
            }
            this.signer = (this.req.options && this.req.options.signer)
                ? this.req.options.signer
                : this.wallets[0].meta.addresses[0]
            this.isSelectable = !(this.req.options && this.req.options.signer)
        },
        hasTheSigner(): boolean {
            if (this.req.options && this.req.options.signer) {
                let addrList: string[] = []
                this.wallets.forEach(wallet => {
                    addrList = [...addrList, ...wallet.meta.addresses]
                })

                return addrList.includes(this.req.options.signer)
            } else {
                return true
            }
        },
        // build Tx
        async onChecked(connex: Connex, estGas: EstimateGasResult) {
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
                if (this.wallet) {
                    const vault = await Vault.decode(this.wallet.vault)
                    const node = await vault.derive(this.wallet.meta.addresses.indexOf(this.signer))
                    const pk = await node.unlock(pin)
                    const st = builtTx.signTx(pk)
                    // TODO recode
                    console.log(st.id)
                    this.$axios.post(`${this.node!.url}/transactions`, Buffer.from(JSON.stringify({ raw: '0x' + st.encode().toString('hex') })), {
                        headers: { 'Content-Type': 'application/json' }
                    }).then(console.log)
                }
            } catch (error) {
                this.signed = false
                console.log(error)
            }
        }
    }
})
</script>
