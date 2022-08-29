<template>
    <div class="column fit">

        <page-toolbar :title="$t('ipfs.title')" />

        <page-content class="col">
            <q-list padding>

                <q-separator inset="item" />
                <item
                    icon="lock"
                    :title="$t('ipfs.action_ipfs_upload')"
                    clickable
                    @click="onClickUploadFile()"
                />
                <q-separator inset="item" />
                <item
                    icon="lock"
                    :title="$t('ipfs.action_ipfs_storage')"
                    clickable
                    @click="onClickChangeHistory()"
                />
                <q-separator inset="item" />

                <q-separator inset="item" />

            </q-list>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Item from './Item.vue'
import UploadForm from 'pages/UploadForm'
import { BioPass } from 'src/utils/bio-pass'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'

export default Vue.extend({
    components: { Item, PageToolbar, PageContent },
    asyncComputed: {
        bioPass() {
            return BioPass.open()
        },
        bioPassSaved(): Promise<boolean> {
            return this.$svc.config.getBioPassOn()
        }
    },
    methods: {
        async onClickUploadFile() {
            try {
                await this.$dialog<string>({ component: UploadForm })
            } catch { }
        },

        async onClickChangeHistory() {
            try {
                await this.$dialog<string>({ component: UploadForm })
            } catch { }
        }
    }
})
</script>
