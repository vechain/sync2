<template>
    <div class="fit column no-wrap">
        <div class="q-mx-sm column">
            <AddressInfo :address="address" :network="networkBadgeText"> {{wallet.meta.name + ' #' + (addressIndex + 1)}} </AddressInfo>
        </div>
        <div class="q-px-md row items-center justify-between">
            <span class="text-h6 q-py-sm"> Assets </span>
            <q-btn
                :to="{name: 'tokens-setting'}"
                flat
                dense
                icon="mdi-plus-circle-outline"
                aria-label="manage"
                size="md"
            />
        </div>
        <div
            class="q-px-xs column scroll"
            v-scrollDivider.both
        >
            <ConnexObject
                v-slot="{connex}"
                :node="node"
            >
                <BalanceList
                    :connex="connex"
                    :address="address"
                    :tokens="tokenList"
                    selectabel
                    @select="tokenSelect"
                />
            </ConnexObject>
        </div>
        <div class="row align-center justify-center q-gutter-md q-pb-lg q-pt-md q-mt-auto">
            <q-btn
                class="col-4 justify-center"
                @click="onSend"
                label="Send"
            />
            <ReceiveDialog
                class="col-4 justify-center"
                :address="address"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { tokenBalanceOf } from 'components/queries'
// import SendDialog from './SendDialog.vue'

export default Vue.extend({
    data() {
        return {
            showType: false
        }
    },
    props: {
        wId: String,
        i: String
    },
    computed: {
        wallet(): M.Wallet | undefined {
            return this.$state.wallet.list.find(i => {
                return i.id === parseInt(this.wId, 10)
            })
        },
        networkBadgeText(): string {
            const net = Vue.filter('net')(this.wallet!.gid)
            if (net === 'main') {
                return ''
            }
            return net
        },
        tokenList(): M.TokenSpec[] {
            return this.$state.config.token.specs(this.wallet!.gid, true)
        },
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.wallet!.gid)!
        },
        addressIndex(): number {
            return parseInt(this.i, 10)
        },
        address(): string {
            return this.wallet!.meta.addresses[parseInt(this.i, 10)]
        }
    },
    methods: {
        tokenSelect(sym: string) {
            this.$router.push({
                name: 'account-transfer-logs',
                query: {
                    wId: this.wId,
                    i: this.i,
                    symbol: sym
                }
            })
        },
        onSend() {
            this.$router.push({
                name: 'send',
                query: {
                    wId: this.wId,
                    i: this.i,
                    defaultSymbol: ''
                }
            })
        },
        tokenBalanceOf
    }
})
</script>
