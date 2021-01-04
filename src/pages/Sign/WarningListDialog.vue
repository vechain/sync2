<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
    >
        <q-card class="full-width">
            <q-toolbar v-if="title">
                <q-toolbar-title>
                    {{title}}
                </q-toolbar-title>
            </q-toolbar>
            <q-list padding>
                <error-tip
                    v-for="(w, i) in warnings"
                    :key="i"
                    type="warning"
                    invert
                    :error="w"
                />
            </q-list>
            <q-card-actions
                v-if="!noAction"
                align="right"
            >
                <q-btn
                    flat
                    color="primary"
                    label="Cancel"
                    @click="hide()"
                />
                <q-btn
                    flat
                    color="primary"
                    label="Continue"
                    @click="ok()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import ErrorTip from './ErrorTip.vue'

export default Vue.extend({
    components: { ErrorTip },
    props: {
        title: String,
        warnings: Array as () => Error[],
        noAction: Boolean
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok() {
            this.$emit('ok')
            this.hide()
        }
    }
})
</script>
