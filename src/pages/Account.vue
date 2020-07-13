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
                    <connex-continuous
                        :connex="connex"
                        :query="() => connex.thor.account(address).get()"
                        v-slot="{data}"
                    >
                        <q-list>
                            <template>
                                <TokenBalanceItem
                                    :balance="data && data.balance"
                                    :token="{symbol: 'VET', name: 'VeChain', decimals: 18}"
                                />
                                <q-separator inset="item" />
                                <TokenBalanceItem
                                    :balance="data && data.energy"
                                    :token="{symbol: 'VTHO', name: 'VeChain Thor', decimals: 18}"
                                />
                            </template>

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
                                        :token="spec"
                                        :balance="data"
                                    />
                                </connex-continuous>
                            </template>
                        </q-list>
                    </connex-continuous>
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
import { tokenBalanceOf } from 'components/queries'

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
        tokenSpecs(): M.TokenSpec[] {
            return this.$state.config.token.specs(this.wallet!.gid, true)
        },
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.wallet!.gid)!
        },
        address(): string {
            return this.wallet!.meta.addresses[parseInt(this.i, 10)]
        }
    },
    methods: {
        tokenBalanceOf,
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
