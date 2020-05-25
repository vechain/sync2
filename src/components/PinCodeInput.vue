<template>
    <div class="relative-position">
        <!-- pattern="[0-9]*" and inputmode="numeric" are needed to bring up numeric keypad -->
        <input
            :id="iid"
            :name="iid"
            class="full-width hidden-input"
            type="text"
            v-model="raw"
            autocorrect="off"
            autocomplete="off"
            autocapitalize="off"
            pattern="[0-9]*"
            inputmode="numeric"
        >
        <label
            :for="iid"
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
        len: { default: 6 },
        mask: { default: '-●' }
    },
    data: () => {
        return {
            iid: `pin-${Date.now().toString(16)}`,
            raw: '',
            code: ''
        }
    },
    watch: {
        raw(newVal: string) {
            this.code = this.raw = newVal
                .split('')
                .filter(c => c >= '0' && c <= '9')
                .join('')
                .slice(0, this.len)
        },
        code(newVal: string) {
            if (newVal.length === this.len) {
                this.$emit('input', newVal)
            }
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
