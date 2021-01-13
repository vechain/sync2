<template>
    <div
        class="fit column no-wrap"
        v-if="wallet"
    >
        <page-toolbar
            :title="$t('asset.title')"
            :gid="wallet.gid"
        />
        <page-content>
            <async-resolve
                v-if="token"
                :promise="$svc.bc(token.gid).balanceOf(address, token)"
                v-slot={data}
            >
                <head-item
                    :token="token"
                    :balance="data"
                >
                    <q-item-label class="row">
                        {{token.symbol}}
                        <amount-label class="q-ml-auto" :value="data" :decimals="token.decimals" > --.-- </amount-label>
                    </q-item-label>
                    <q-item-label
                        caption
                        lines="1"
                        v-if="wallet"
                    >{{wallet.meta.name}}</q-item-label>
                    <q-item-label caption>
                        ┗ <address-label :addr="address" />
                    </q-item-label>
                </head-item>
            </async-resolve>
            <q-item dense>
                <q-item-section>
                    <q-item-label header>
                        {{$t('asset.label_history')}}
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn
                        flat
                        round
                        icon="mdi-send"
                        :to="{name: 'send', query: { wid: walletId, i: addressIndex, symbol: symbol }}"
                    />
                </q-item-section>
            </q-item>
        </page-content>
        <page-content class="col">
            <Logs
                v-if="token"
                :address="address"
                :token="token"
                :pageSize="20"
            />
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Logs from './Logs.vue'
import HeadItem from './HeadItem.vue'
import AsyncResolve from 'components/AsyncResolve'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'
import AddressLabel from 'components/AddressLabel.vue'
import AmountLabel from 'components/AmountLabel.vue'
export default Vue.extend({
    components: {
        Logs,
        HeadItem,
        AsyncResolve,
        PageToolbar,
        PageContent,
        AddressLabel,
        AmountLabel
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
