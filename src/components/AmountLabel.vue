<template>
    <span>
        <template v-if="formatted">
            {{formatted.int}}<span
                style="font-size:80%"
                v-if="formatted.dec"
            >{{`${formatted.sep}${formatted.dec}`}}</span>
        </template>
        <slot v-else>
            !!invalid amount!!
        </slot>
    </span>
</template>
<script lang="ts">
import Vue from 'vue'
import { BigNumber } from 'bignumber.js'
import { formatAmount } from 'src/utils/format'

export default Vue.extend({
    props: {
        value: [Number, String, Object as () => BigNumber],
        decimals: Number,
        fixed: { // least length of decimal part
            type: Number,
            default: 2
        },
        long: Boolean // full precision
    },
    computed: {
        formatted() {
            return formatAmount(this.value, {
                unit: this.decimals,
                fixed: this.fixed,
                fullPrecision: this.long
            })
        }
    }
})
</script>
