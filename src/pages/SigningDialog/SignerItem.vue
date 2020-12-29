<template>
    <q-item
        v-bind="$attrs"
        v-on="$listeners"
        active-class="bg-blue-1"
    >
        <q-item-section avatar>
            <address-avatar
                v-if="isTextAddress"
                :addr="text"
                size="md"
            />
        </q-item-section>
        <q-item-section no-wrap>
            <q-item-label
                v-if="isTextAddress"
                class="monospace ellipsis"
            >
                {{ text | checksum | abbrev(8, 6) }}
            </q-item-label>
            <q-item-label
                v-else
                class="ellipsis"
            >
                {{ text }}
            </q-item-label>
            <q-item-label
                class="ellipsis"
                v-if="caption"
                caption
            >
                {{ caption }}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-icon
                v-if="sideIcon"
                size="xs"
                :name="sideIcon"
            />
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import { address } from 'thor-devkit'

export default Vue.extend({
    components: { AddressAvatar },
    props: {
        text: String,
        caption: String,
        sideIcon: String
    },
    computed: {
        isTextAddress() {
            return address.test(this.text)
        }
    }
})
</script>
