<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <address-avatar :addr="address" />
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="reline monospace text-body2"
                lines="2"
            >{{address | checksum}}</q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'
export default Vue.extend({
    components: {
        AddressAvatar
    },
    props: {
        address: String
    }
})
</script>
<style scoped>
.reline {
    word-break: break-all;
}
</style>
