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
                        <Async
                            :fn="getEstGas(connex)"
                            v-slot="{data: estGas}"
                        >
                            <q-list class="full-width">
                                <Priority
                                    :gas="estGas && estGas.gas"
                                    :bgp="estGas && estGas.baseGasPrice"
                                    v-model="gasPriceCoef"
                                />
                                <AccountSelectorDialog
                                    v-model="signer"
                                    :tokens="tokens"
                                    :wallets="wallets"
                                    :connex="connex"
                                    :isSelectable="isSelectable"
                                />
                                <q-item>
                                    <SlideBtn
                                        @checked="onChecked"
                                        label="Slide to Sign"
                                        style="width: 70%"
                                        class="absolute-center"
                                    />
                                </q-item>
                            </q-list>
                        </Async>
                    </ConnexObject>
                </q-card-actions>
            </div>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import { QDialog } from 'quasar'
import Vue from 'vue'
import { tokenSpecs } from '../consts'
import { estimateGas, EstimateGasResult } from '../utils/tx'

export default Vue.extend({
    props: {
        req: Object as () => M.TxRequest,
        gid: String,
        after: Function as unknown as () => (((resp: M.TxResponse) => Promise<void>) | undefined)
    },
    data() {
        return {
            signer: '',
            isSelectable: false,
            tokenSpecs,
            gasPriceCoef: 0
        }
    },
    computed: {
        clauseList(): Connex.Thor.Clause[] {
            return this.req.message.map((item: Connex.Vendor.TxMessage[0]) => {
                return {
                    to: item.to,
                    data: item.data,
                    value: item.value
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
        }
    },
    created() {
        this.initData()
    },
    methods: {
        async getEstGas(connex: Connex): Promise<EstimateGasResult | null> {
            if (this.signer && connex) {
                return await estimateGas(connex, this.clauseList, this.suggettedGas, this.signer)
            } else {
                return null
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
        onChecked() {
            console.log('checked')
        }
    }
})
</script>
