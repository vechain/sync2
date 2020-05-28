<template>
    <label
        :for="forId"
        class="row flex-center no-wrap"
    >
        <span
            class="col-1 text-center"
            style="min-width:1rem;"
            v-for="(_, i) in len"
            :key="i"
        >{{char(i)}}</span>
    </label>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        value: String, // for v-model
        len: { default: 6 },
        forId: String,
        mask: { default: '○●' }
    },
    data: () => {
        return {
            code: ''
        }
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    methods: {
        char(i: number) {
            const ch = this.code[i]
            return ch ? (this.mask[1] || ch) : this.mask[0]
        }
    },
    watch: {
        value: {
            handler(newVal: string) {
                this.code = newVal
                    .split('')
                    .filter(c => c >= '0' && c <= '9')
                    .join('')
                    .slice(0, this.len)
                this.$emit('input', this.code)
            },
            immediate: true
        },
        code(newVal: string) {
            if (newVal.length === this.len) {
                this.$nextTick(() => {
                    this.$emit('fulfilled', newVal)
                })
            }
        }
    }
})
</script>
