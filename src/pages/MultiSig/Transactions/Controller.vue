<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('address.label_transactions')" :gid="wallet && wallet.gid" />
        <template v-if="wallet">
            <page-content>
                <head-item :address="address" :name="wallet.meta.name" />
            </page-content>
            <page-content class="col">
                <q-list>
                    <async-resolve v-for="(index) in multiSigTransactions" tag="div"
                        :promise="transactionDataForIndex(index)" v-slot="{data}" :key="index">
                        <q-separator v-if="index !== 0" inset="item" />
                        <transaction-item :transaction="data" :confirmationsRequired="confirmationsRequired" :index="index"></transaction-item>
                    </async-resolve>
                </q-list>
            </page-content>
        </template>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import HeadItem from './HeadItem.vue'
import AsyncResolve from 'components/AsyncResolve'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'
import TransactionItem from './TransactionItem.vue'
import { abi } from '../contract.json'

export default Vue.extend({
    components: {
        HeadItem,
        AsyncResolve,
        PageToolbar,
        PageContent,
        TransactionItem
    },
    props: {
        walletId: String,
        addressIndex: String
    },
    methods: {
        async transactionDataForIndex(index: number): Promise<any> {
            const transactions = abi.find(({ name }) => name === 'transactions')
            let thor
            if (!this.wallet || !transactions || !(thor = this.$svc.bc(this.wallet.gid).thor)) {
                return []
            }

            const { decoded } = await thor
                .account(this.wallet.meta.addresses[0])
                .method(transactions)
                .call(index)

            return decoded
        }
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        multiSigTransactions: {
            async get(): Promise<number[]> {
                const getTransactionCount = abi.find(({ name }) => name === 'getTransactionCount')
                let thor
                if (!this.wallet || !getTransactionCount || !(thor = this.$svc.bc(this.wallet.gid).thor)) {
                    return []
                }

                const { decoded: { 0: count } } = await thor
                    .account(this.wallet.meta.addresses[0])
                    .method(getTransactionCount)
                    .call()

                return [...new Array(parseInt(count))].map((_, index) => index).reverse()
            },
            default: []
        },
        confirmationsRequired: {
            async get(): Promise<number> {
                const numConfirmationsRequired = abi.find(({ name }) => name === 'numConfirmationsRequired')
                let thor
                if (!this.wallet || !numConfirmationsRequired || !(thor = this.$svc.bc(this.wallet.gid).thor)) {
                    return 0
                }

                const { decoded: { 0: count } } = await thor
                    .account(this.wallet.meta.addresses[0])
                    .method(numConfirmationsRequired)
                    .call()

                return parseInt(count)
            },
            default: []
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
