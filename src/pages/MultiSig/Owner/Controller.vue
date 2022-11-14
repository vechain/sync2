<template>
    <div class="column fit">
        <page-toolbar :title="$t('ownerMultiSig.title')">
            <q-btn class="q-ml-auto" flat round icon="add" @click="onAdd" />
        </page-toolbar>
        <page-content class="col">
            <q-list padding>
                <template v-for="(ownerAddress, index) in owners">
                    <q-separator v-if="index !== 0" :key="ownerAddress+'sep'" inset="item" />
                    <q-item :key="ownerAddress">
                        <q-item-section>
                            <q-item-label lines="1">{{ ownerAddress }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
            <div class="text-center">
                <q-spinner-dots v-if="loading" />
            </div>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageContent from 'components/PageContent.vue'
import PageToolbar from 'components/PageToolbar.vue'
import AddDialog from './AddDialog.vue'
import Contract from '../const'

export default Vue.extend({
    components: { PageContent, PageToolbar },
    props: {
        walletId: String
    },
    data: () => {
        return {
            loading: false
        }
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.wallet!.gid).thor }
    },
    asyncComputed: {
        async wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        async owners(): Promise<string[]> {
            if (!this.wallet) {
                return []
            }

            this.loading = true
            const { decoded: { 0: owners } } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(Contract.getOwners)
                .call()

            this.loading = false
            return owners
        }
    },
    methods: {
        async onAdd() {
            try {
                const address = await this.$dialog<string>({
                    component: AddDialog,
                    state: { address: '' }
                })

                const addOwnerClause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.addOwner)
                    .asClause(address)

                await this.$signTx(this.wallet!.gid, {
                    message: [addOwnerClause],
                    options: {
                        signer: this.wallet!.meta.addresses[0],
                        comment: this.$t('transactionsMultiSig.action_confirm_transaction').toString()
                    }
                })
            } catch { }
        }
    }
})
</script>
