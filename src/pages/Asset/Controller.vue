<template>
    <div
        class="fit column no-wrap"
        v-if="wallet"
    >
        <page-toolbar
            :title="symbol"
            :gid="wallet.gid"
        />
        <div class="narrow-page q-mx-auto">
            <async-resolve
                v-if="token"
                :promise="$svc.bc(token.gid).balanceOf(address, token)"
                v-slot={data}
            >
                <head-item
                    :token="token"
                    :balance="data"
                >
                    <q-btn
                        flat
                        round
                        :label="$t('asset.action_transfer')"
                        :to="{name: 'send', query: { wid: walletId, i: addressIndex, defaultSymbol: symbol }}"
                    />
                </head-item>
            </async-resolve>
            <span class="text-h6 q-py-sm q-px-md">{{$t('asset.label_transfer')}}</span>
        </div>
        <div
            class="overflow-auto"
            v-scrollDivider.both
        >
            <Logs
                class="narrow-page q-mx-auto"
                v-if="token"
                :address="address"
                :token="token"
                :pageSize="20"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Logs from './Logs.vue'
import HeadItem from './HeadItem.vue'
import AsyncResolve from 'components/AsyncResolve'

export default Vue.extend({
    components: {
        Logs,
        HeadItem,
        AsyncResolve
    },
    data() {
        return {
            showQR: false
        }
    },
    props: {
        walletId: String,
        addressIndex: String,
        symbol: String
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        token: {
            async get(): Promise<M.TokenSpec | null> {
                const wallet = this.wallet
                if (!wallet) {
                    return null
                }
                const [tokens, activeSymbols] = await Promise.all([
                    this.$svc.config.token.all(),
                    this.$svc.config.token.activeSymbols()
                ])
                return tokens.filter(token => {
                    return token.gid === wallet.gid &&
                        (activeSymbols.includes(token.symbol) || token.permanent)
                }).find(token => token.symbol === this.symbol) || null
            },
            default: null
        }
    },
    computed: {
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[parseInt(this.addressIndex)] : ''
        }
    }
})
</script>
