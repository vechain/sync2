<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
        @show="onShow()"
    >
        <div class="fit overflow-hidden">
            <q-btn
                size="lg"
                class="q-ml-md float-left"
                style="z-index: 1111"
                flat
                dense
                round
                icon="close"
                text-color="white" @click="hide()" />
            <Scanner
                class="fit"
                @input="onScanned"
                @error="onError"
            />
        </div>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import Scanner from './Scanner.vue'
import { QDialog } from 'quasar'

export default Vue.extend({
    components: { Scanner },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
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
        },
        onShow() {
            // make the backdrop invisible
            // don't use 'seamless' style here, since the dialog will not respond to back button if so
            const backdrop = this.$el.getElementsByClassName('q-dialog__backdrop').item(0)
            backdrop && backdrop.classList.add('invisible')
        }
    }
})
</script>
