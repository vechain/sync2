<template>
    <q-btn
    v-bind="$attrs"
        label="Receive"
    >
        <q-popup-proxy
            v-model="show"
            maximized
            persistent
            transition-show="slide-up"
            transition-hide="slide-down"
        >
            <q-card>
                <q-toolbar>
                    <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        @click="show = false"
                    />
                    <q-toolbar-title class="absolute-center text-capitalize">
                        Receive Assets
                    </q-toolbar-title>
                </q-toolbar>
                <div class="text-center q-px-md q-pt-xl">
                    Share your account address to receive funds

                    <AddressAvatar
                        class="q-mx-auto q-mt-xl q-mb-lg relative-position"
                        style="height: 190px; width: 280px; border-radius: 18px;"
                        :addr="address"
                    >
                        <QRCode
                            class="absolute-center overflow-hidden"
                            style="height: 150px;width: 150px; border-radius: 10px"
                        >{{address | checksum}}</QRCode>
                    </AddressAvatar>
                    <div
                        class="monospace q-my-md text-center text-grey q-px-lg"
                        style="word-break: break-all; border-radius: 15px;"
                    >{{address | checksum}}</div>
                    <q-btn
                        class="q-mt-xl full-width"
                        @click="onCopy"
                        color="blue-9"
                    >Copy</q-btn>
                </div>
            </q-card>
        </q-popup-proxy>
    </q-btn>
</template>

<script lang="ts">
import Vue from 'vue'
import { copyToClipboard } from 'quasar'
export default Vue.extend({
    props: {
        address: String
    },
    data() {
        return {
            show: false
        }
    },
    methods: {
        onCopy() {
            copyToClipboard(Vue.filter('checksum')(this.address)).then(
                () => {
                    this.$q.notify('copied')
                }
            ).catch(console.error)
        }
    }
})
</script>
