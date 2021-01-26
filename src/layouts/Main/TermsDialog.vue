<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        persistent
    >
        <q-card class="full-width column no-wrap">
            <q-card-section class="overflow-auto col">
                {{terms.msg()}}
            </q-card-section>
            <q-card-section>
                <q-checkbox
                    dense
                    v-model="accepted"
                    :label="terms.label()"
                />
            </q-card-section>
            <q-card-actions>
                <q-btn
                    :disable="!accepted"
                    class="w40 q-mx-auto"
                    color="primary"
                    unelevated
                    :label="$t('common.continue')"
                    @click="ok()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'

export type Terms = {
    msg: () => string,
    label: () => string
}

export default Vue.extend({
    props: {
        terms: Object as () => Terms
    },
    data() {
        return { accepted: false }
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
