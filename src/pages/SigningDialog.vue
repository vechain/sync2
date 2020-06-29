<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <q-toolbar>
                <q-toolbar-title class="absolute-center">
                    Sign
                </q-toolbar-title>
                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click="hide"
                />
                This is the signing dialog
            </q-toolbar>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'

export default Vue.extend({
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        }
    }
})
</script>
