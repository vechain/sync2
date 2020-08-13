<template>
    <div
        :style="{background: `url('${svg}')  0% 0% / cover no-repeat`}"
    >
        <slot />
    </div>
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
