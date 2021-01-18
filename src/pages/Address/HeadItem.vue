<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <address-avatar
                :addr="address"
                size="xl"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>
                <address-label :addr="address" />
            </q-item-label>
            <q-item-label
                caption
                class="ellipsis"
            >
                {{name}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-btn
                flat
                round
                @click="showQR"
                icon="qr_code_2"
            />
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import AddressLabel from 'src/components/AddressLabel.vue'
import { address } from 'thor-devkit'

export default Vue.extend({
    components: {
        AddressAvatar,
        AddressLabel
    },
    props: {
        address: String,
        name: String
    },
    methods: {
        showQR() {
            const content = address.toChecksumed(this.address)
            this.$qrcode({
                title: this.$t('address.action_receive').toString(),
                content,
                message: content,
                messageClass: 'text-center'
            })
        }
    }
})
</script>
