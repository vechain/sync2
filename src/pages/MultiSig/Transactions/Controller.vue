<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('address.label_transactions')" :gid="wallet && wallet.gid" />
        <template v-if="wallet">
            <page-content>
                <head-item :address="address" :name="wallet.meta.name" />
            </page-content>
            <page-content class="col">
                <Logs
                    :address="wallet.meta.addresses[0]"
                    :signer="multiSigOwnerSigner"
                    :gid="wallet.gid"
                    :walletId="String(wallet.id)"
                    :confirmationsRequired="confirmationsRequired"
                    :pageSize="20"
                />
            </page-content>
        </template>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import HeadItem from './HeadItem.vue'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'
import Logs from './Logs.vue'
import Contract from '../const'

export default Vue.extend({
    components: {
        HeadItem,
        PageToolbar,
        PageContent,
        Logs
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
                if (!this.wallet) {
                    return 0
                }

                const { decoded: { 0: count } } = await this.thor
                    .account(this.wallet.meta.addresses[0])
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
