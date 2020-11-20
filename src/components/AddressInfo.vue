<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <AddressAvatar
                class="q-mx-auto relative-position"
                :style="isNormal ? 'width: 60px; height: 60px; border-radius: 30px;' : 'width: 40px; height: 40px; border-radius: 20px;'"
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
            <q-item-label
                v-if="isNormal"
                class="text-body1 reline ellipsis-2-lines"
            >
                <slot />
            </q-item-label>
            <q-item-label
                :class="isNormal ? 'text-grey' : ''"
                class="reline monospace text-body2"
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
    },
    computed: {
        isNormal(): boolean {
            return !!this.$slots.default
        }
    }
})
</script>
<style scoped>
.reline {
    word-break: break-all;
}
</style>
