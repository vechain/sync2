<template>
    <div
        class="fit column no-wrap"
        v-if="wallet"
    >
        <page-toolbar
            :title="symbol"
            :gid="wallet.gid"
        />
        <div class="q-mx-sm">
            <AddressInfo :address="address"> {{wallet.meta.name + ' #' + (addressIndex + 1)}} </AddressInfo>
        </div>
        <span class="text-h6 q-py-sm q-px-md">Transfers </span>
        <div
            class="scroll"
            v-scrollDivider
        >
            <Logs
                v-if="tokens.length"
                :address="address"
                :tokens="tokens"
                :pageSize="20"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Logs from './Logs.vue'
export default Vue.extend({
    name: 'AccountTransferLogs',
    components: {
        Logs
    },
    props: {
        wid: String,
        i: String,
        symbol: String
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.wid))
        },
        tokens: {
            async get(): Promise<M.TokenSpec[]> {
                const [w, tokens, activeSymbols] = await Promise.all(
                    [
                        this.$svc.wallet.get(parseInt(this.wid)),
                        this.$svc.config.token.all(),
                        this.$svc.config.token.activeSymbols()
                    ]
                )
                return tokens.filter(token => {
                    return token.gid === w!.gid &&
                        (activeSymbols.includes(token.symbol) || token.permanent) &&
                        token.symbol === this.symbol
                })
            },
            default: []
        }
    },
    computed: {
        addressIndex(): number {
            return parseInt(this.i, 10)
        },
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[this.addressIndex] : ''
        }
    }
})
</script>
