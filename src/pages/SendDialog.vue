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
            <q-toolbar>
                <q-btn
                    flat
                    @click="hide"
                    icon="close"
                />
                <q-toolbar-title class="absolute-center text-capitalize">
                    Send Assets
                </q-toolbar-title>
            </q-toolbar>
            <q-form class="q-px-md">
                <q-input
                    v-model="to"
                    label="To:"
                />
                <q-item
                    class="q-my-md"
                    clickable
                    @click="showSelect"
                >
                    <q-item-section avatar>
                        <q-avatar
                            color="primary"
                            text-color="white"
                        >
                            {{currentToken.symbol.slice(0,1)}}
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">{{currentToken.symbol}}</q-item-label>
                        <q-item-label
                            caption
                            lines="2"
                        >
                            {{currentToken.name}}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="unfold_more" />
                    </q-item-section>
                </q-item>
                <q-input
                    v-model="total"
                    type="number"
                    inputmode="decimal"
                    :label="symbol"
                />
                <ConnexObject
                    v-slot="{connex}"
                    :node="node"
                >
                    <connex-continuous
                        :key="symbol"
                        :connex="connex"
                        :query="() => query(connex)"
                        v-slot="{data}"
                    >
                        <div class="text-center text-grey q-mt-sm">
                            <span>balance: {{data | balance(currentToken.decimals)}}</span>
                        </div>
                    </connex-continuous>
                </ConnexObject>
                <q-btn
                    class="full-width q-mt-xl"
                    dark
                    @click="onSend"
                >Send</q-btn>
            </q-form>

        </q-card>
        <q-dialog ref="tokenList">
            <q-card class="q-dialog-plugin q-pa-md">
                <ConnexObject
                    v-slot="{connex}"
                    :node="node"
                >

                    <q-list>
                        <connex-continuous
                            :connex="connex"
                            :query="() => connex.thor.account(address).get()"
                            v-slot="{data}"
                        >
                            <TokenBalanceItem
                                @click="onSelect('VET')"
                                clickable
                                :balance="data && data.balance"
                                :token="{symbol: 'VET', name: 'VeChain', decimals: 18}"
                            />
                            <q-separator inset="item" />
                            <TokenBalanceItem
                                @click="onSelect('VTHO')"
                                clickable
                                :balance="data && data.energy"
                                :token="{symbol: 'VTHO', name: 'VeChain Thor', decimals: 18}"
                            />
                        </connex-continuous>
                        <template v-for="(spec, index) in tokenSpecs">
                            <q-separator
                                :key="`${index}-s`"
                                inset="item"
                            />
                            <connex-continuous
                                :connex="connex"
                                :key="index"
                                :query="() => tokenBalanceOf(connex, address, spec)"
                                v-slot="{data}"
                            >
                                <TokenBalanceItem
                                    @click="onSelect(spec.symbol)"
                                    clickable
                                    :token="spec"
                                    :balance="data"
                                />
                            </connex-continuous>
                        </template>
                    </q-list>
                </ConnexObject>
            </q-card>
        </q-dialog>
    </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { tokenBalanceOf } from 'components/queries'

export default Vue.extend({
    props: {
        from: String,
        defaultSymbol: String
    },
    data() {
        return {
            to: '',
            total: '',
            symbol: this.defaultSymbol || 'VET'
        }
    },
    created() {
        console.log(this.from)
    },
    computed: {
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.$state.wallet.current!.gid)!
        },
        tokenSpecs(): M.TokenSpec[] {
            return [...this.$state.config.token.specs(this.$state.wallet.current!.gid, true)]
        },
        currentToken(): M.TokenSpec | undefined {
            const infos = {
                address: '',
                desc: '',
                icon: '',
                totalSupply: ''
            }
            if (this.symbol === 'VET') {
                return {
                    symbol: 'VET',
                    name: 'VeChain',
                    decimals: 18,
                    ...infos
                }
            } else if (this.symbol === 'VTHO') {
                return {
                    symbol: 'VTHO',
                    name: 'VeChain Thor',
                    decimals: 18,
                    ...infos
                }
            } else {
                return this.tokenSpecs.find(item => this.symbol === item.symbol)
            }
        },
        query(): (connex: Connex) => Promise<string> {
            if (['VET', 'VTHO'].includes(this.symbol)) {
                return async (connex: Connex) => {
                    const account = await connex.thor.account(this.from).get()
                    return this.symbol === 'VET' ? account.balance : account.energy
                }
            } else {
                return (connex: Connex) => {
                    return this.tokenBalanceOf(connex, this.from, this.currentToken!)
                }
            }
        }
    },
    methods: {
        tokenBalanceOf,
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        showSelect() {
            (this.$refs.tokenList as any).show()
        },
        onSelect(symbol: string) {
            (this.$refs.tokenList as any).hide()
            this.symbol = symbol
        },
        onSend() {
            this.$signTx({ message: [] })
        }
    }
})
</script>
