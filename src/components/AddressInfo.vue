<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <AddressAvatar
                class="q-mx-auto"
                style="width: 80px; height: 80px; border-radius: 40px;"
                :addr="address"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label class="text-body1 reline ellipsis-2-lines">
                <slot />
            </q-item-label>
            <q-item-label
                class="text-grey reline text-body2"
                lines="2"
            >{{address | checksum}}</q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
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
