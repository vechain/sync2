<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <address-avatar :addr="address" />
        </q-item-section>
        <q-item-section>
            <address-label :addr="address"/>
            <q-item-label
                class="text-body2 text-grey"
                lines="1"
            >
                {{name}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-btn
                flat
                round
                @click="showQR"
                icon="qr_code"
            />
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import AddressLabel from 'src/components/AddressLabel.vue'
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
            this.$qrcode({
                title: this.$t('address.action_receive').toString(),
                content: Vue.filter('checksum')(this.address)
            })
        }
    }
})
</script>
