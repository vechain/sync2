<template>
    <q-dialog
        position="bottom"
        ref="dialog"
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="absolute-center text-capitalize">
                    {{req.title}}
                </q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-responsive class="q-mx-auto" style="max-width: 240px" :ratio="1">
                    <q-r-code class="full-width">{{req.content}}</q-r-code>
                </q-responsive>
            </q-card-section>
            <q-card-actions>
                <q-btn
                    @click="onCopy"
                    class="w40 q-mx-auto"
                    unelevated
                    color="primary"
                >{{$t('common.copy')}}</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { copyToClipboard, QDialog } from 'quasar'
import QRCode from 'components/QRCode.vue'
export default Vue.extend({
    components: {
        QRCode
    },
    props: {
        req: Object as () => M.QRRequest
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        onCopy() {
            copyToClipboard(this.req.content).then(
                () => {
                    this.$q.notify(this.$t('common.copied'))
                }
            ).catch(console.error)
        }
    }
})
</script>
