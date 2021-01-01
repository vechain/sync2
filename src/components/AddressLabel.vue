<template>
    <div
        v-if="isAddressValid"
        class="inline row no-wrap"
    >
        <address-avatar
            v-if="avatar"
            size="1em"
            style="margin-right:0.5em"
            :addr="addr"
        />
        <span class="monospace address col">{{full ? addr: checksumedAbbrev}}</span>
    </div>
    <span v-else>
        <slot>!!Invalid address!!</slot>
    </span>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressAvatar from './AddressAvatar.vue'
import { address } from 'thor-devkit'

export default Vue.extend({
    components: { AddressAvatar },
    props: {
        addr: String,
        avatar: Boolean,
        full: Boolean
    },
    computed: {
        isAddressValid() {
            return address.test(this.addr)
        },
        checksumedAbbrev() {
            const a = address.toChecksumed(this.addr)
            return a.slice(0, 6) + '⋯' + a.slice(-6)
        }
    }
})
</script>
<style scoped>
.address {
    letter-spacing: 0.08em;
    transform: scale(1, 0.8);
}
</style>
