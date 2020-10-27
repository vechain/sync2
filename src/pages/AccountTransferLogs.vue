<template>
    <div class="fit column no-wrap">
        <div class="q-mx-sm">
            <AddressInfo :address="address" :network="networkBadgeText"> {{wallet.meta.name + ' #' + (addressIndex + 1)}} </AddressInfo>
        </div>
        <span class="text-h6 q-py-sm q-px-md">Transfers </span>
        <div
            class="scroll"
            v-scrollDivider
        >
            <ConnexObject
                v-slot="{connex}"
                :node="node"
            >
                <Logs
                    v-if="connex"
                    :connex="connex"
                    :address="address"
                    :tokens="tokens"
                    :pageSize="20"
                />
            </ConnexObject>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { tokenSpecs } from '../consts'
export default Vue.extend({
    props: {
        wId: String,
        i: String,
        symbol: String
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
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.wallet!.gid)!
        },
        tokens(): M.TokenSpec[] | null {
            const token = [...this.$state.config.token.specs(this.wallet!.gid, true), tokenSpecs.VTHO].find((item: M.TokenSpec) => {
                return item.symbol === this.symbol
            })

            return token ? [token] : null
        },
        addressIndex(): number {
            return parseInt(this.i, 10)
        },
        address(): string {
            return this.wallet!.meta.addresses[parseInt(this.i, 10)]
        }
    },
    methods: {

    }
})
</script>
