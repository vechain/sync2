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
                    @click="onClickChangePassword()"
                />

                <q-separator inset="item" />
                <item
                    icon="control_point_duplicate"
                    :title="$t('ipfs.action_ipfs_storage')"
                    :to="{name: 'image-board'}"
                />
                <q-separator inset="item" />

                <q-separator inset="item" />
                <!-- <q-separator inset="item" />
                <template v-if="bioPass">
                    <item
                        icon="fingerprint"
                        :title="$t('common.bio_auth')"
                    >
                        <q-toggle
                            color="green"
                            :value="bioPassSaved"
                            :disable="!bioPass"
                            @input="toggleBioPass"
                        />
                    </item>
                    <q-separator inset="item" />
                </template> -->

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
// import { kdfEncrypt } from 'src/core/vault'
// import { openURL } from 'quasar'

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
        // TODO faceID
        // async toggleBioPass(newVal: boolean) {
        //     const bioPass = this.bioPass
        //     if (!bioPass) {
        //         return
        //     }

        //     try {
        //         if (newVal) {
        //             const umk = await this.$authenticate()
        //             await bioPass.save(
        //                 this.$t('common.bio_auth').toString(),
        //                 this.$t('common.cancel').toString(),
        //                 umk.toString('hex'))
        //         }
        //         await this.$svc.config.setBioPassOn(newVal)
        //     } catch (err) {
        //         console.warn(err)
        //     }
        // },
        // getImage() {
        //     const image = require("https://ipfs.infura.io/ipfs/QmNaveyMaKhqAizwKhc1qQyNxin83WUKAYiH5zfL5roWqV").default
        //     console.log("🚀 ~ file: Controller.vue ~ line 87 ~ getImage ~ image", image)
        //     return image
        // },
        async onClickChangePassword() {
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
