<template>
    <span>
        <template v-if="formattedParts">
            {{formattedParts[0]}}<span
                style="font-size:80%"
                v-if="formattedParts[1]"
            >{{`${decSep}${formattedParts[1]}`}}</span>
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

                if (this.long) {
                    // full precision
                    const [int, dec] = bn.toFormat().split(this.decSep)
                    if (dec) {
                        if (dec.length >= this.fixed) {
                            return [int, dec]
                        }
                        return [int, dec + '0'.repeat(this.fixed - dec.length)]
                    }
                    if (this.fixed > 0) {
                        return [int, '0'.repeat(this.fixed)]
                    }
                    return [int]
                }
                return bn.toFormat(this.fixed, 3/* ROUND_FLOOR */).split(this.decSep)
            } catch {
                return null
            }
        }
    }
})
</script>
