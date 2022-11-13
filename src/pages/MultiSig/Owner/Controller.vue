<template>
    <div class="column fit">
        <page-toolbar :title="$t('ownerMultiSig.title')" />
        <page-content class="col">
            <q-list padding>
                <template v-for="(ownerAddress, index) in owners">
                    <q-separator v-if="index !== 0" :key="ownerAddress" inset="item" />
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
import { abi } from '../contract.json'

export default Vue.extend({
    components: { PageContent, PageToolbar },
    props: {
        walletId: String,
        gid: String
    },
    data: () => {
        return {
            loading: false
        }
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor }
    },
    asyncComputed: {
        async wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        async owners(): Promise<string[]> {
            const getOwners = abi.find(({ name }) => name === 'getOwners')
            if (!this.wallet || !getOwners) {
                return []
            }

            this.loading = true
            const { decoded: { 0: owners } } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(getOwners)
                .call()

            this.loading = false
            return owners
        }
    }
})
</script>
