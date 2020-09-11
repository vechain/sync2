<template>
    <div class="fit column no-wrap q-pt-lg">
        <div class="q-px-xl">
            <AddressAvatar
                class="q-mx-auto"
                style="height: 128px; width: 200px; border-radius: 15px;"
                :addr="address"
            />
            <div
                class="monospace q-my-lg text-center text-grey"
                style="word-break: break-all;"
            >{{address | checksum}}</div>
        </div>
        <div class="row justify-center q-gutter-md">
            <q-btn
                @click="onSend"
                class="col-4"
            >Send</q-btn>
            <q-btn
                @click="onReceiveClick"
                class="col-4"
            >Receive</q-btn>
        </div>
        <q-tabs
            class="q-mt-lg"
            dense
            v-model="tab"
        >
            <q-tab
                name="assets"
                label="Assets"
            />
            <q-tab
                name="transfers"
                @click="typeChange"
            >
                <div>
                    <span>{{transferTab}}</span>
                    <q-icon :name="showType ? 'arrow_drop_up' : 'arrow_drop_down'" />
                </div>
            </q-tab>
        </q-tabs>
        <ConnexObject
            v-slot="{connex}"
            :node="node"
        >
            <!-- v-calcHeight -->
            <q-tab-panels
                keep-alive
                v-model="tab"
            >
                <q-tab-panel
                    name="assets"
                    class="q-px-sm"
                >
                    <BalanceList
                        :connex="connex"
                        :address="address"
                        :tokens="tokenList"
                    />
                </q-tab-panel>
                <q-tab-panel
                    name="transfers"
                    class="q-px-sm column"
                >
                    <Logs
                        v-show="transfer === 'Tokens'"
                        :connex="connex"
                        :address="address"
                        :tokens="[tokenSpecs.VTHO, ...tokenList]"
                        :pageSize="10"
                    />
                    <Logs
                        v-show="transfer === 'VET'"
                        :connex="connex"
                        :address="address"
                        :pageSize="10"
                    />
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
                <q-toolbar>
                    <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        @click="hide"
                    />
                    <q-toolbar-title class="absolute-center text-capitalize">
                        Receive Assets
                    </q-toolbar-title>
                </q-toolbar>
                <div class="text-center q-px-md q-pt-xl">
                    Share your account address to receive funds

                    <AddressAvatar
                        class="q-mx-auto q-mt-xl q-mb-lg relative-position"
                        style="height: 190px; width: 280px; border-radius: 18px;"
                        :addr="address"
                    >
                        <QRCode
                            class="absolute-center overflow-hidden"
                            style="height: 150px;width: 150px; border-radius: 10px"
                        >{{address | checksum}}</QRCode>
                    </AddressAvatar>
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
import { copyToClipboard, QDialog } from 'quasar'
import { tokenBalanceOf } from 'components/queries'
import { tokenSpecs } from '../consts'
import SendDialog from './SendDialog.vue'

export default Vue.extend({
    data() {
        return {
            tab: 'assets',
            transfer: 'VET',
            tokenSpecs,
            showType: false
        }
    },
    props: {
        wId: String,
        i: String
    },
    computed: {
        transferTab(): string {
            return `${this.transfer} Transfers`
        },
        wallet(): M.Wallet | undefined {
            return this.$state.wallet.list.find(i => {
                return i.id === parseInt(this.wId, 10)
            })
        },
        tokenList(): M.TokenSpec[] {
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
        typeChange() {
            if (this.tab === 'assets') {
                return
            }
            this.showType = true
            this.$actionSheets([
                {
                    label: 'VET',
                    onClick: () => {
                        this.transfer = 'VET'
                    }
                },
                {
                    label: 'Tokens',
                    onClick: () => {
                        this.transfer = 'Tokens'
                    }
                }
            ]).then(() => {
                this.showType = false
            })
        },
        onSend() {
            this.$q.dialog({
                component: SendDialog,
                parent: this,
                from: this.address,
                gid: this.wallet!.gid
            })
        },
        tokenBalanceOf,
        onCopy() {
            copyToClipboard(Vue.filter('checksum')(this.address)).then(
                () => {
                    this.$q.notify('copied')
                }
            ).catch(console.error)
        },
        onReceiveClick() {
            (this.$refs.dialog as QDialog).show()
        },
        hide() {
            (this.$refs.dialog as QDialog).hide()
        }
    }
})
</script>
