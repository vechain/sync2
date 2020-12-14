<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="column full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">Import</q-toolbar-title>
            </q-toolbar>
            <q-form @submit="onSubmit()">
                <q-card-section class="col">
                    <q-input
                        v-model="words"
                        label="Please input your mnemonic words"
                        type="textarea"
                        outlined
                        :error="!!error"
                        :error-message="error"
                        no-error-icon
                        @keydown.enter.prevent="onSubmit()"
                    />
                </q-card-section>
                <q-card-actions class="row flex-center">
                    <q-btn
                        class="col-6"
                        unelevated
                        color="primary"
                        label="OK"
                        type="submit"
                    />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { mnemonic } from 'thor-devkit'

export default Vue.extend({
    data: () => {
        return {
            words: '',
            error: ''
        }
    },
    watch: {
        words() {
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
            const wordsArray = this.words.split(' ').filter(w => !!w)
            if (!mnemonic.validate(wordsArray)) {
                this.error = 'Invalid mnemonic words'
                return
            }
            this.ok(wordsArray)
        }
    }
})
</script>
