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
                        :promise="transactionDataForIndex(index)" v-slot="{ data }" :key="index">
                        <q-separator v-if="index !== 0" inset="item" />
                        <page-content v-if="!data" class="text-center">
                            <q-spinner-dots />
                        </page-content>
                        <transaction-item v-if="data" :transaction="data" :confirmationsRequired="confirmationsRequired"
                            :index="index" :confirmTransaction="handleConfirmTransaction(index)"
                            :executeTransaction="handleExecuteTransaction(index)"
                            :revokeConfirmation="handleRevokeConfirmation(index)"></transaction-item>

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
import Contract from '../const'

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
    data: () => {
        return {
            loading: true
        }
    },
    methods: {
        handleConfirmTransaction(index: number): Function {
            return () => this.confirmTransaction(index)
        },
        handleExecuteTransaction(index: number): Function {
            return () => this.executeTransaction(index)
        },
        handleRevokeConfirmation(index: number): Function {
            return () => this.revokeConfirmation(index)
        },
        async transactionDataForIndex(index: number): Promise<object> {
            if (!this.wallet) {
                return { to: null, isConfirmed: false, data: null, value: 0 }
            }

            const { decoded: transaction } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(Contract.transactions)
                .call(index)

            const { decoded: { 0: isConfirmed } } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(Contract.isConfirmed)
                .call(index, this.multiSigOwnerSigner)

            return { ...transaction, isConfirmed }
        },
        async confirmTransaction(index: number) {
            if (!this.multiSigOwnerSigner) {
                return
            }

            try {
                const clause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.confirmTransaction)
                    .asClause(index)

                await this.$signTx(this.wallet!.gid, {
                    message: [clause],
                    options: {
                        signer: this.multiSigOwnerSigner,
                        comment: this.$t('transactionsMultiSig.action_confirm_transaction').toString()
                    }
                })
            } catch (err) {

            }
        },
        async executeTransaction(index: number) {
            if (!this.multiSigOwnerSigner) {
                return
            }

            try {
                const clause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.executeTransaction)
                    .asClause(index)

                await this.$signTx(this.wallet!.gid, {
                    message: [clause],
                    options: {
                        signer: this.multiSigOwnerSigner,
                        comment: this.$t('transactionsMultiSig.action_execute_transaction').toString()
                    }
                })
            } catch (err) {

            }
        },
        async revokeConfirmation(index: number) {
            if (!this.multiSigOwnerSigner) {
                return
            }

            try {
                const clause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.revokeConfirmation)
                    .asClause(index)

                await this.$signTx(this.wallet!.gid, {
                    message: [clause],
                    options: {
                        signer: this.multiSigOwnerSigner,
                        comment: this.$t('transactionsMultiSig.action_revoke_confirmation').toString()
                    }
                })
            } catch (err) {

            }
        }
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        multiSigTransactions: {
            async get(): Promise<number[]> {
                if (!this.wallet) {
                    return []
                }

                const { decoded: { 0: count } } = await this.thor
                    .account(this.wallet.meta.addresses[0])
                    .method(Contract.getTransactionCount)
                    .call()

                return [...new Array(parseInt(count))].map((_, index) => index).reverse()
            },
            default: []
        },
        confirmationsRequired: {
            async get(): Promise<number> {
                const { decoded: { 0: count } } = await this.thor
                    .account(this.wallet!.meta.addresses[0])
                    .method(Contract.numConfirmationsRequired)
                    .call()

                return parseInt(count)
            },
            default: 0
        },
        async multiSigOwnerSigner(): Promise<string> {
            if (!this.wallet) {
                return ''
            }

            const { decoded: { 0: owners } } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(Contract.getOwners)
                .call()

            const wallets = await this.$svc.wallet.getByGid(this.wallet.gid)
            for (const wallet of wallets) {
                for (const signer of wallet.meta.addresses) {
                    if (owners.includes(signer)) {
                        return signer
                    }
                }
            }

            return ''
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
