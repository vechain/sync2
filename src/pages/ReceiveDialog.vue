<template>
    <q-dialog v-bind="$attrs" v-on="$listeners">
        <q-card class="q-pb-lg">
            <q-toolbar>
                <q-btn
                    flat
                    round
                    dense
                    v-close-popup
                    icon="close"
                />
                <q-toolbar-title class="absolute-center text-capitalize">
                    {{$t('address.action_receive')}}
                </q-toolbar-title>
            </q-toolbar>
            <div class="text-center q-px-md q-pt-xl">
                {{$t('asset.msg_receive')}}

                <div
                    class="q-mx-auto q-mt-xl q-mb-lg relative-position"
                    style="height: 190px; width: 280px; border-radius: 18px;"
                >
                    <q-r-code
                        class="absolute-center overflow-hidden"
                        style="height: 150px;width: 150px; border-radius: 10px"
                    >{{address | checksum}}</q-r-code>
                </div>
                <div
                    class="monospace q-my-md text-center q-px-lg"
                    style="word-break: break-all; border-radius: 15px;"
                >{{address | checksum}}</div>
                <div class="row q-mt-xl justify-center">
                    <q-btn
                        @click="onCopy"
                        class="w40 q-mx-auto"
                        unelevated
                        color="primary"
                    >{{$t('common.copy')}}</q-btn>
                </div>
            </div>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { copyToClipboard } from 'quasar'
import QRCode from 'components/QRCode.vue'
export default Vue.extend({
    components: {
        QRCode
    },
    props: {
        address: String
    },
    methods: {
        onCopy() {
            copyToClipboard(Vue.filter('checksum')(this.address)).then(
                () => {
                    this.$q.notify(this.$t('common.copied'))
                }
            ).catch(console.error)
        }
    }
})
</script>
