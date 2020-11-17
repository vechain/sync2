<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <AddressAvatar
                class="q-mx-auto relative-position"
                style="width: 60px; height: 60px; border-radius: 30px;"
                :addr="address"
            >
                <div class="absolute-bottom flex">
                    <q-badge
                        style="opacity: 0.9"
                        v-if="network"
                        class="text-capitalize q-mx-auto"
                        color="orange"
                        :label="network"
                    />
                </div>
            </AddressAvatar>
        </q-item-section>
        <q-item-section>
            <q-item-label class="text-body1 reline ellipsis-2-lines">
                <slot />
            </q-item-label>
            <q-item-label
                class="text-grey reline text-body2 monospace"
                lines="2"
            >{{address | checksum}}</q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        address: String,
        network: String
    }
})
</script>
<style scoped>
.reline {
    word-break: break-all;
}
</style>
