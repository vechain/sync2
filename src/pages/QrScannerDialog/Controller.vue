<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <div class="fit overflow-hidden bg-black">
            <Scanner
                class="fit"
                @input="onScanned"
                @error="onError"
            />
            <q-btn
                flat
                dense
                round
                icon="mdi-close"
                text-color="white"
                class="absolute-top-left"
                @click="hide()"
            />
        </div>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import Scanner from './Scanner.vue'

export default Vue.extend({
    components: { Scanner },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },

        onScanned(code: string) {
            this.ok(code)
        },
        onError(err: Error) {
            console.warn(err)
            this.hide()
        }
    }
})
</script>
