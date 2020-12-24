<template>
    <q-avatar v-bind="$attrs">
        <img :src="svg" />
    </q-avatar>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'
export default Vue.extend({
    props: {
        addr: String
    },
    computed: {
        svg(): string {
            return this.addr ? `data:image/svg+xml;utf8,${picasso(this.addr.toLowerCase())}` : ''
        }
    }
})
</script>
