<template>
    <span>
        <template v-if="formattedParts">
            {{formattedParts[0]}}<span style="font-size:80%">{{`${decSep}${formattedParts[1]}`}}</span>
        </template>
        <slot v-else>
            !!invalid amount!!
        </slot>
    </span>
</template>
<script lang="ts">
import Vue from 'vue'
import { BigNumber } from 'bignumber.js'

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
        decSep() {
            return BigNumber.config(undefined as unknown as {}).FORMAT!.decimalSeparator!
        },
        formattedParts(): string[] | null {
            try {
                // convert to human friendly unit
                const bn = new BigNumber(this.value)
                    .div('1' + '0'.repeat(this.decimals))

                // NaN or Infinite is not valid
                if (!bn.isFinite()) {
                    return null
                }

                // split into integer and decimal part
                const [int, dec] = bn.toFormat(this.fixed, 3/* ROUND_FLOOR */).split(this.decSep)
                if (this.long) {
                    // full precision
                    const [, fullDec] = bn.toFormat().split(this.decSep)
                    if (fullDec && fullDec.length > dec.length) {
                        return [int, fullDec]
                    }
                }
                return [int, dec]
            } catch {
                return null
            }
        }
    }
})
</script>
