<template>
    <div class="fit column no-wrap">
        <page-toolbar
            :title="$t('account.title')"
            :gid="wallet && wallet.gid"
        />
        <template v-if="wallet">
            <div class="narrow-page q-mx-auto">
                <head-item
                    :address="address"
                    :name="wallet.meta.name"
                />
                <q-item dense>
                    <q-item-section>
                        <q-item-label header>
                            {{$t('account.label_assets')}}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn
                            :to="{name: 'tokens-setting'}"
                            flat
                            round
                            icon="add"
                        />
                    </q-item-section>
                </q-item>
            </div>
            <div
                class="col overflow-auto"
                v-scrollDivider.top
            >
                <q-list class="narrow-page q-mx-auto">
                    <async-resolve
                        v-for="(token, index) in tokenList"
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
                    </async-resolve>
                </q-list>
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'
import HeadItem from './HeadItem.vue'
import AsyncResolve from 'components/AsyncResolve'

export default Vue.extend({
    components: {
        TokenItem,
        HeadItem,
        AsyncResolve
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
