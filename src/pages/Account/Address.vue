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
            />
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
            >
                {{address | checksum}}
                <q-btn
                    flat
                    padding="0px"
                    icon="qr_code"
                    round
                    color="dark"
                    size="sm"
                    @click="showQR = true"
                />
            </q-item-label>
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
        network: String
    },
    data() {
        return {
            showQR: false
        }
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
