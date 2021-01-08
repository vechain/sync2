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
                    :disable="!state.words"
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
import { mnemonic } from 'thor-devkit'

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
        onSubmit() {
            const words = this.state.words
                .trim()
                .toLowerCase()
                .split(/\s+/)

            if (words.length < 12 || !mnemonic.validate(words)) {
                this.error = this.$t('newWallet.msg_mnemonic_error').toString()
                return
            }
            this.ok(words)
        }
    }
})
</script>
