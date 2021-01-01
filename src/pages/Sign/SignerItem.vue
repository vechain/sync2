<template>
    <q-item
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-item-section avatar>
            <address-avatar
                v-if="isTextAddress"
                :addr="text"
                size="md"
            />
        </q-item-section>
        <q-item-section no-wrap>
            <q-item-label class="ellipsis">
                <address-label :addr="text" />
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
import AddressLabel from 'src/components/AddressLabel.vue'

export default Vue.extend({
    components: { AddressAvatar, AddressLabel },
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
