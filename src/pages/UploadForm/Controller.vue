<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{hint}}</prompt-dialog-toolbar>
            <q-form @submit="onSubmit()">
                <q-card-section>
                    <div
                        v-if="!image"
                        class="center-upload"
                    >
                        <label class="uploadLabelBlue">
                            <input
                                type="file"
                                @change="onFileChange"
                                class="uploadButton"
                            >
                            Upload
                        </label>
                    </div>
                    <div
                        v-else
                        class="center-upload"
                    >
                        <img :src="image" />
                        <q-spinner-dots
                            v-if="isUpload"
                            color="primary"
                        />
                        <q-btn
                            v-else
                            v-disableFocusHelper
                            class="w40 q-mx-auto"
                            :label="action"
                            unelevated
                            color="primary"
                            type="submit"
                        />

                    </div>
                </q-card-section>
                <q-card-actions>

                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

export default Vue.extend({
    components: { PromptDialogToolbar },
    data: () => {
        return {
            password: '',
            inputValue: '',
            error: '',
            file: null,
            image: '',
            base64FileData: '',
            isUpload: false

        }
    },
    computed: {
        hint(): string {
            return this.$t('uploadForm.title').toString()
        },
        action(): string {
            return this.$t('ipfs.start_upload').toString()
        }
    },
    watch: {
        inputValue() { this.error = '' }
    },
    methods: {
        show() { (this.$refs.dialog as QDialog).show() },
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: string) {
            this.$emit('ok', result)
            this.hide()
        },
        // eslint-disable-next-line
        onFileChange(e: any) {
            const files = e.target.files || e.dataTransfer.files
            if (!files.length) {
                return
            }

            this.createImage(files[0])
        },
        // eslint-disable-next-line
        createImage(file: any) {
            const reader = new FileReader()
            // eslint-disable-next-line
            reader.onload = (e: any) => {
                this.image = e.target.result
                const res = reader.result?.toString()
                if (res) {
                    this.base64FileData = res
                }
            }
            reader.readAsDataURL(file)
        },

        uploadFileToIpfs: async function () {
            if (this.base64FileData) {
                const resUpload = await this.$svc.ipfs.uploadFileToIpfs(this.base64FileData)
                const cids = localStorage.getItem('CID')
                if (resUpload.cid) {
                    const cidsArray = cids ? JSON.parse(cids) : []
                    cidsArray.push(resUpload.cid.path)
                    localStorage.setItem('CID', JSON.stringify(cidsArray))
                }
            }
        },
        async onSubmit() {
            await this.uploadFileToIpfs()
            this.error = ''
            await this.$nextTick()
            this.hide()
        }

    }
})
</script>
