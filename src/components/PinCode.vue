<template>
    <div class="row flex-center no-wrap">
        <div
            v-for="(_, i) in len"
            class="code q-ma-xs"
            :class="{filled: i<code.length}"
            :key="i"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

const validCodes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export default Vue.extend({
    props: {
        value: String,
        len: { default: 6 }
    },
    data: () => {
        return { code: '' }
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    watch: {
        code(newVal: string) {
            if (newVal.length === this.len) {
                this.$emit('fulfilled', newVal)
            }
        },
        value: {
            handler(newVal: string) {
                this.code = newVal
                    .split('')
                    .filter(c => validCodes.includes(c))
                    .join('')
                    .slice(0, this.len)
                if (newVal !== this.code) {
                    this.$emit('input', this.code)
                }
            },
            immediate: true
        }
    }
})
</script>
<style scoped>
.code {
    width: 1.2rem;
    height: 1.2rem;
    border: 1px solid black;
}
.filled {
    background-color: black;
}
</style>
