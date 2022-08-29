<template>
    <div class="column fit">
        <page-toolbar :title="$t('ipfs.action_images_list')" />
        <page-content class="col">
            <q-list
                v-if="listImages.length>0"
                padding
            >
                <template v-for="(item, index) in listImages">

                    <q-item :key="index">

                        <span> {{index + 1}} &nbsp;&nbsp;</span>
                        <q-item-section side>
                            <q-btn
                                class="w50 q-mx-auto"
                                color="primary"
                                :label="$t('ipfs.show_file')"
                                @click="getImageData(item.url)"
                            />
                        </q-item-section>
                        <q-item-section>

                            <q-item-label
                                lines="1"
                                @click="copyCid(item.hash)"
                            >{{'Click to copy'}}</q-item-label>
                            <q-item-label class="wrap-string">
                                <a
                                    v-bind:href="
                                item.url"
                                    target="_blank"
                                >{{'Link to IPFS'}}</a>
                            </q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-btn
                                class="w50 q-mx-auto"
                                color="deep-orange"
                                :label="$t('ipfs.delete_file')"
                                @click="deleteHash(item.hash)"
                            />
                        </q-item-section>

                    </q-item>

                </template>
            </q-list>
            <img
                v-if="base64FileData"
                :src="base64FileData"
            />

        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageContent from 'components/PageContent.vue'
import PageToolbar from 'components/PageToolbar.vue'
import ImageWidget from 'pages/ImageWidget.vue'

export default Vue.extend({
    components: { PageContent, PageToolbar },
    data: () => {
        return {
            activeSymbols: null as string[] | null,
            base64FileData: '',
            cids: []
        }
    },
    methods: {
        async getImageData(pathToIpfs: string) {
            try {
                await this.$dialog<string>({ component: ImageWidget, pathToImageIpfs: pathToIpfs })
            } catch { }
        },
        copyCid(cid: string) {
            navigator.clipboard.writeText(cid)
            alert('Copied the CID hash: ' + cid)
        },
        deleteHash(hash: string) {
            this.cids = this.cids.filter(cid => cid !== hash)
            localStorage.setItem('CID', JSON.stringify(this.cids))
            alert('You deleted hash  locally only, the file stored in IPFS as usual')
        }
    },
    asyncComputed: {

        listImages: {
            async get(): Promise<M.IPFSdata[]> {
                const images: M.IPFSdata[] = []
                const cidsStr = localStorage.getItem('CID')
                if (cidsStr) {
                    this.cids = JSON.parse(cidsStr) || []
                    this.cids.reverse().map(cid => images.push({ hash: cid, url: `https://ipfs.infura.io/ipfs/${cid}` }))
                }
                return Promise.resolve(images)
            },
            default: []
        }
    },
    async beforeDestroy() {
        if (this.activeSymbols) {
            await this.$svc.config.token.saveActiveSymbols(this.activeSymbols)
        }
    }

})
</script>
