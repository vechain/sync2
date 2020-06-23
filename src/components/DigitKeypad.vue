<template>
    <div class="row keypad q-col-gutter-xs q-mt-xs q-pb-xs q-pr-xs bg-grey-3">
        <div
            v-for="(k, i) in keys"
            :key="i"
            class="col-4"
        >
            <q-btn
                class="full-width text-h5"
                unelevated
                color="white"
                text-color="black"
                :class="{invisible: !k}"
                @click="onClickKey(k)"
                :ripple="false"
            >{{k[0]}}</q-btn>
        </div>
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
