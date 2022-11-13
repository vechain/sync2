<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('address.title')" :gid="wallet && wallet.gid" />
        <template v-if="wallet">
            <page-content>
                <head-item :address="address" :name="wallet.meta.name" />
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
                        <q-separator v-if="index !== 0" inset="item" />
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
                    <q-separator inset="item" v-if="wallet.meta.type === 'multisig'" />
                    <multi-sig-item :transactions="multiSigTransactionCount" v-if="wallet.meta.type === 'multisig'">
                        <q-btn icon="preview" dense flat :to="{
                            name: 'transactions-multisig',
                            params: {
                                walletId: String(wallet.id),
                                addressIndex: addressIndex
                            }
                        }" />
                    </multi-sig-item>
                </q-list>
            </page-content>
        </template>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'
import MultiSigItem from './MultiSigItem.vue'
import HeadItem from './HeadItem.vue'
import AsyncResolve from 'components/AsyncResolve'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'
import { abi } from '../MultiSig/contract.json'

export default Vue.extend({
    components: {
        TokenItem,
        MultiSigItem,
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
                const getTransactionCount = abi.find(({ name }) => name === 'getTransactionCount')
                let thor
                if (!this.wallet || !getTransactionCount || !(thor = this.$svc.bc(this.wallet.gid).thor)) {
                    return '0'
                }

                const { decoded: { 0: count } } = await thor
                    .account(this.wallet.meta.addresses[0])
                    .method(getTransactionCount)
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
        }
    }
})
</script>
