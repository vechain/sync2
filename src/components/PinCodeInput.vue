<template>
    <div class="relative-position">
        <input
            v-bind="binds"
            class="full-width hidden-input"
            v-model="raw"
        >
        <label
            :for="binds.id"
            class="absolute-full row justify-center items-center"
        >
            <span
                class="col-1 text-center"
                v-for="(_, i) in len"
                :key="i"
            >{{char(i)}}</span>
        </label>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        value: String, // for v-model
        len: { default: 6 },
        mask: { default: '-●' }
    },
    data: () => {
        return {
            raw: ''
        }
    },
    computed: {
        binds() {
            const iid = `pin-${Date.now().toString(16)}`
            return {
                id: iid,
                name: iid,
                type: 'text',
                autocomplete: 'off',
                autocapitalize: 'off',
                autocorrect: 'off',
                // pattern="[0-9]*" and inputmode="numeric" are needed to bring up numeric keypad
                pattern: '[0-9]*',
                inputmode: 'numeric'
            }
        },
        // sanitized code
        code() {
            return this.raw
                .split('')
                .filter(c => c >= '0' && c <= '9')
                .join('')
                .slice(0, this.len)
        }
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    watch: {
        value(newVal: string) {
            this.raw = newVal
        },
        code(newVal: string) {
            this.$emit('input', newVal)
            if (newVal.length === this.len) {
                this.$emit('fulfilled', newVal)
            }
            this.raw = newVal
        }
    },
    methods: {
        char(i: number) {
            const ch = this.code[i]
            return ch ? (this.mask[1] || ch) : this.mask[0]
        }
    }
})
</script>
<style scoped>
.hidden-input {
    color: transparent;
    border: none;
    outline: none;
    caret-color: transparent;
}
.hidden-input:focus {
    outline: none;
}
</style>
