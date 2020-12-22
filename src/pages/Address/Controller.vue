<template>
    <div
        class="fit column no-wrap"
        v-if="wallet"
    >
        <page-toolbar
            :title="$t('account.title')"
            :gid="wallet.gid"
        />
        <div class="col column narrow-page q-mx-auto">
            <div class="q-mx-sm">
                <head-item :address="address">
                    {{wallet.meta.name}}
                </head-item>
            </div>
            <div class="q-px-md row items-center justify-between">
                <span class="text-h6 q-py-sm"> {{$t('account.label_assets')}} </span>
                <q-btn
                    :to="{name: 'tokens-setting'}"
                    flat
                    dense
                    icon="add"
                    aria-label="manage"
                    size="md"
                />
            </div>
            <div
                class="q-px-xs col scroll q-pb-sm"
                v-scrollDivider.top
            >
                <q-list>
                    <template v-for="(token, index) in tokenList">
                        <resolve
                            tag="div"
                            :promise="$svc.bc(token.gid).balanceOf(address, token)"
                            v-slot="{data}"
                            :key="token.symbol"
                        >
                            <q-separator
                                v-if="index !== 0"
                                inset="item"
                            />
                            <TokenItem
                                :token="token"
                                :balance="data"
                                @click="onTokenClick(token.symbol)"
                            />
                        </resolve>
                    </template>
                </q-list>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'
import HeadItem from './HeadItem.vue'

export default Vue.extend({
    components: {
        TokenItem,
        HeadItem
    },
    props: {
        walletId: String,
        addressIndex: String
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        tokenList: {
            async get(): Promise<M.TokenSpec[]> {
                const wallet = this.wallet
                if (!wallet) {
                    return []
                }
                const [tokens, activeSymbols] = await Promise.all([
                    this.$svc.config.token.all(),
                    this.$svc.config.token.activeSymbols()
                ])
                return tokens.filter(token => token.gid === wallet.gid && (activeSymbols.includes(token.symbol) || token.permanent))
            },
            default: []
        }
    },
    computed: {
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[parseInt(this.addressIndex)] : ''
        }
    },
    methods: {
        onTokenClick(sym: string) {
            this.$router.push({
                name: 'asset',
                params: {
                    walletId: this.walletId,
                    addressIndex: this.addressIndex,
                    symbol: sym
                }
            })
        },
        onSend() {
            this.$router.push({
                name: 'send',
                query: {
                    wid: this.walletId,
                    i: this.addressIndex
                }
            })
        }
    }
})
</script>
