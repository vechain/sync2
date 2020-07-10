<template>
    <div
        class="fit overflow-auto q-pt-lg"
        v-scrollDivider
    >
        <div class="q-px-xl">
            <div
                class="q-mx-auto"
                style="height: 128px; width: 200px; border-radius: 15px;"
                :style="{background: `url('${svg}')  0% 0% / cover no-repeat`}"
            ></div>

            <div
                class="monospace q-my-lg text-center text-grey"
                style="word-break: break-all;"
            >{{address | checksum}}</div>
        </div>
        <div class="row justify-center q-gutter-md">
            <q-btn class="col-4">Send</q-btn>
            <q-btn
                @click="onReceiveClick"
                class="col-4"
            >Receive</q-btn>
        </div>
        <q-tabs
            class="q-mt-lg"
            dense
            align="left"
            v-model="tab"
        >
            <q-tab
                name="assets"
                label="Assets"
            />
            <q-tab
                name="transfers"
                label="Transfers"
            />
        </q-tabs>
        <ConnexObject
            v-slot="{connex}"
            :node="node"
        >
            <q-tab-panels v-model="tab">
                <q-tab-panel name="assets">

                    <TokensBalance
                        :connex="connex"
                        :list="list"
                        :address="address"
                        :tokens="tokens"
                    >
                        <template v-slot="{balances}">
                            <q-list>
                                <template v-for="(item, index) in list">
                                    <TokenItem
                                        :token="item"
                                        :key="index"
                                    >
                                        <template v-slot>
                                            <span v-if="balances && balances[item.symbol]">
                                                {{ balances[item.symbol].balance | balance(balances[item.symbol].decimals) }}
                                            </span>
                                            <span v-else>--</span>
                                        </template>
                                    </TokenItem>
                                    <q-separator
                                        v-if="index !== list.length - 1"
                                        :key="item.symbol"
                                        inset="item"
                                    />
                                </template>
                            </q-list>
                        </template>
                    </TokensBalance>

                </q-tab-panel>
                <q-tab-panel name="transfers">
                    Transfers
                </q-tab-panel>
            </q-tab-panels>
        </ConnexObject>
        <q-dialog
            ref="dialog"
            @hide="$emit('hide')"
            maximized
            persistent
            transition-show="slide-up"
            transition-hide="slide-down"
        >
            <q-card>
                <!-- toolbar -->
                <q-toolbar>
                    <q-btn
                        flat
                        icon="close"
                        @click="hide"
                    />
                    <q-toolbar-title class="absolute-center text-capitalize">
                        Receive Assets
                    </q-toolbar-title>
                </q-toolbar>
                <div class="text-center q-px-md q-pt-xl">
                    Share your account address to receive funds
                    <div
                        class="q-mx-auto q-mt-xl q-mb-lg relative-position"
                        style="height: 190px; width: 280px; border-radius: 18px;"
                        :style="{background: `url('${svg}')  0% 0% / cover no-repeat`}"
                    >
                        <QRCode
                            class="absolute-center overflow-hidden"
                            style="height: 150px;width: 150px; border-radius: 10px"
                        >{{address | checksum}}</QRCode>
                    </div>
                    <div
                        class="monospace q-my-md text-center text-grey q-px-lg"
                        style="word-break: break-all; border-radius: 15px;"
                    >{{address | checksum}}</div>
                    <q-btn
                        class="q-mt-xl"
                        @click="onCopy"
                    >Copy</q-btn>
                </div>
            </q-card>
        </q-dialog>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'
import { copyToClipboard } from 'quasar'

export default Vue.extend({
    data() {
        return {
            tab: 'assets',
            svg: ''
        }
    },
    props: {
        wId: String,
        i: String
    },
    created() {
        this.svg = `data:image/svg+xml;utf8,${picasso(this.address)}`
    },
    computed: {
        wallet(): M.Wallet | undefined {
            return this.$state.wallet.list.find(i => {
                return i.id === parseInt(this.wId, 10)
            })
        },
        tokens(): M.Token[] {
            return this.$state.config.token.getList(this.wallet!.gid)
        },
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.wallet!.gid)!
        },
        list(): { name: string, symbol: string }[] {
            return [{ name: 'VeChain Token', symbol: 'VET' }, ...this.$state.config.token.getList(this.wallet!.gid)]
        },
        address(): string {
            return this.wallet!.meta.addresses[parseInt(this.i, 10)]
        }
    },
    methods: {
        onCopy() {
            copyToClipboard(Vue.filter('checksum')(this.address)).then().catch()
        },
        onReceiveClick() {
            (this.$refs.dialog as any).show()
        },
        hide() { (this.$refs.dialog as any).hide() }
    }
})
</script>
