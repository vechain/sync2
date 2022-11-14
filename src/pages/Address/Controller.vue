<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('address.title')" :gid="wallet && wallet.gid" />
        <template v-if="wallet">
            <page-content>
                <head-item :address="address" :name="wallet.meta.name" />
                <q-btn
                    v-if="wallet.meta.type === 'multisig'" unelevated class="full-width" :to="{
                        name: 'transactions-multisig',
                        params: {
                            walletId: String(wallet.id),
                            addressIndex: addressIndex
                        }
                    }">
                    <q-item-section>
                        <q-item-label>{{multiSigTransactionCount}} {{ $t('address.label_multisig_transactions') }}</q-item-label>
                    </q-item-section>
                </q-btn>

                <q-item dense>
                    <q-item-section>
                        <q-item-label header>
                            {{ $t('address.label_assets') }}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn :to="{ name: 'tokens-setting' }" flat round icon="control_point_duplicate" />
                    </q-item-section>
                </q-item>
            </page-content>
            <page-content class="col">
                <q-list>
                    <async-resolve v-for="(token, index) in tokenList" tag="div"
                        :promise="$svc.bc(token.gid).balanceOf(address, token)" v-slot="{ data }" :key="token.symbol">
                        <q-separator v-if="index !== 0 || wallet.meta.type === 'multisig'" inset="item" />
                        <token-item :token="token" :balance="data">
                            <q-btn icon="preview" dense flat :to="{
                                name: 'asset',
                                params: {
                                    walletId: walletId,
                                    addressIndex: addressIndex,
                                    symbol: token.symbol
                                }
                            }" />
                            <q-btn icon="send" dense flat :to="{
                                name: 'send',
                                query: { wid: walletId, i: addressIndex, symbol: token.symbol }
                            }" />
                        </token-item>
                    </async-resolve>
                </q-list>
            </page-content>
        </template>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'
import HeadItem from './HeadItem.vue'
import AsyncResolve from 'components/AsyncResolve'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'
import Contract from '../MultiSig/const'

export default Vue.extend({
    components: {
        TokenItem,
        HeadItem,
        AsyncResolve,
        PageToolbar,
        PageContent
    },
    props: {
        walletId: String,
        addressIndex: String
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        multiSigTransactionCount: {
            async get(): Promise<string> {
                if (!this.wallet) {
                    return '0'
                }

                const { decoded: { 0: count } } = await this.thor
                    .account(this.wallet.meta.addresses[0])
                    .method(Contract.getTransactionCount)
                    .call()

                return count
            },
            default: '0'
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
        },
        thor(): Connex.Thor { return this.$svc.bc(this.wallet!.gid).thor }
    }
})
</script>
