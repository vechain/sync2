<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar> </prompt-dialog-toolbar>

            <div v-if="loaded">
                <q-card-section>
                    <q-responsive :ratio="3.1 / 2.125">
                        <img
                            v-if="typeData === 'image'"
                            :src="base64FileData"
                        />
                        <textarea
                            v-if="typeData === 'text'"
                            rows="80"
                            cols="60"
                            v-model="textData"
                        />
                        <iframe
                            v-if="typeData === 'pdf'"
                            :src="b64DecodeUnicode(base64FileData)"
                            width="100%"
                            height="100%"
                        >
                        </iframe>

                        <div v-if="typeData === 'audio'">
                            <q-btn
                                @click="playSound(isPlayerStart)"
                                align="between"
                                color="primary"
                                label='Audio file'
                                icon="audiotrack"
                            />
                        </div>
                        <video
                            v-if="typeData === 'video'"
                            width="320"
                            height="240"
                            controls
                        >
                            <source
                                :src="base64FileData"
                                type="video/mp4"
                            >
                        </video>

                    </q-responsive>
                </q-card-section>

            </div>
            <div v-else>
                <h2 class="spinner-upload">
                    <q-spinner-dots color="primary" />
                </h2>

            </div>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

const TypesBase64Data = {
    text: ['data:application/json;base64', 'data:text/plain;base64',
        'data:text/csv;base64'],
    ppt: ['data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64'],
    pdf: ['data:application/pdf;base64'],
    image: ['data:data:image/png;base64', 'data:image/jpeg;base64'],
    video: ['data:video/quicktime;base64', 'data:video/mp4;base64'],
    audio: ['data:audio/mpeg;base64']
}

export default Vue.extend({
    components: { PromptDialogToolbar },
    props: {
        pathToImageIpfs: String
    },
    data: function () {
        return {
            password: '',
            inputValue: '',
            error: '',
            file: null,
            image: '',
            base64FileData: '',
            pathToIpfs: '',
            activeColor: 'red',
            fontSize: 30,
            loaded: false,
            typeData: 'image',
            textData: '',
            isPlayerStart: true,
            // eslint-disable-next-line
            audio: '' as any
        }
    },
    beforeMount() {
        this.hint()
    },
    computed: {

    },
    watch: {

    },

    methods: {
        show() { (this.$refs.dialog as QDialog).show() },
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: string) {
            this.$emit('ok', result)
            this.hide()
        },
        defineType64(data: string) {
            const format = data.split(',')
            Object.values(TypesBase64Data).map((types, index) => {
                Object.values(types).map(formatType => {
                    if (formatType === format[0]) {
                        this.typeData = Object.keys(TypesBase64Data)[index]
                    }
                })
            })
            if (this.typeData !== 'image') {
                this.textData = this.b64DecodeUnicode(format[1])
            }
        },
        b64DecodeUnicode(base64Str: string) {
            const res = Buffer.from(base64Str, 'base64').toString('utf-8')
            return res
        },
        playSound(flag: boolean) {
            if (this.base64FileData && !this.audio) {
                this.audio = new Audio(this.base64FileData)
            }
            if (this.audio) {
                // eslint-disable-next-line
                flag ? this.audio?.play() : this.audio?.pause() // eslint-disable-line
                this.isPlayerStart = !this.isPlayerStart
            }
        },
        hint() {
            return this.$svc.ipfs.getInfoFromIPFS(this.pathToImageIpfs)
                .then(data => {
                    this.loaded = true
                    this.base64FileData = data
                    this.defineType64(this.base64FileData)
                })
        }
    },
    created: function () {
        this.hint()
    }
})
</script>
