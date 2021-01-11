<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">{{$t('newWallet.action_import')}}</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-input
                    ref="input"
                    autofocus
                    v-model="state.words"
                    :label="$t('newWallet.label_mnemonic')"
                    type="textarea"
                    outlined
                    :error="!!error"
                    :error-message="error"
                    no-error-icon
                />
            </q-card-section>
            <q-card-actions>
                <q-btn
                    class="w40 q-mx-auto"
                    unelevated
                    color="primary"
                    :label="$t('common.confirm')"
                    @click="onSubmit()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { hdDeriveMnemonic } from 'src/core/worker'

export default Vue.extend({
    props: {
        state: Object as () => { words: string }
    },
    data: () => {
        return {
            error: ''
        }
    },
    watch: {
        'state.words'() {
            this.error = ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: string[]) {
            this.$emit('ok', result)
            this.hide()
        },
        async onSubmit() {
            const inputEl = (this.$refs.input as Vue).$el.getElementsByTagName('textarea')[0]
            this.error = ''
            const words = this.state.words
                .trim()
                .toLowerCase()

            if (words.length < 1) {
                inputEl.focus()
                return
            }
            try {
                const array = words.split(/\s+/)
                if (array.length < 12) {
                    throw new Error()
                }
                await hdDeriveMnemonic(array, -1)
                this.ok(array)
            } catch {
                inputEl.focus()
                this.error = this.$t('newWallet.msg_mnemonic_error').toString()
            }
        }
    }
})
</script>
