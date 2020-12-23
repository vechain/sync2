<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <q-avatar size="xl">
                <AddressAvatar
                    class="fit"
                    :addr="address"
                />
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="monospace text-body1"
                lines="1"
            >{{address | checksum | abbrev(8, 6)}}
            </q-item-label>
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
                @click="showQR=true"
                icon="qr_code"
            />
        </q-item-section>
        <receive-dialog
            v-model="showQR"
            :address="address"
        />
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import ReceiveDialog from 'src/pages/ReceiveDialog.vue'
export default Vue.extend({
    components: {
        ReceiveDialog
    },
    props: {
        address: String,
        name: String
    },
    data() {
        return {
            showQR: false
        }
    }
})
</script>
