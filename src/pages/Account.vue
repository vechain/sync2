<template>
    <div class="fit column no-wrap">
        <div class="q-mx-lg">
            <AddressInfo :address="address"> {{wallet.meta.name + ' #' + addressIndex}} </AddressInfo>
        </div>
        <div class="q-px-lg row items-center justify-between">
            <span class="text-subtitle1"> Assets </span>
            <q-btn label="Manage" :to="{name: 'tokens-setting'}" flat rounded />
        </div>
        <div
            class="q-px-xs scroll"
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
        <div class="row justify-center q-gutter-md q-py-lg q-mt-auto">
            <q-btn
                class="col-4"
                @click="onSend"
                label="Send"
            />
            <ReceiveDialog
                class="col-4"
                :address="address"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { tokenBalanceOf } from 'components/queries'
import SendDialog from './SendDialog.vue'

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
            this.$q.dialog({
                component: SendDialog,
                parent: this,
                from: this.address,
                gid: this.wallet!.gid
            })
        },
        tokenBalanceOf
    }
})
</script>
