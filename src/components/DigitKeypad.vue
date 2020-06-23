<template>
    <div class="row keypad">
        <q-btn
            v-for="(k, i) in keys"
            :key="i"
            class="col-4 text-h6"
            flat
            :class="{invisible: !k}"
            @click="onClickKey(k)"
            :ripple="false"
        >{{k[0]}}</q-btn>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ['⌫', 'Delete']]
export default Vue.extend({
    data: () => {
        return {
            keys
        }
    },
    methods: {
        onClickKey(k: string | string[]) {
            const ev = new KeyboardEvent('keydown', { key: k[1] || k[0] })
            this.$el.parentElement!.dispatchEvent(ev)
        }
    }
})
</script>
<style scoped>
body.q-ios-padding .keypad {
    padding-bottom: env(safe-area-inset-bottom) !important;
}
</style>
