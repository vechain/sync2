<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">Set New Password</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <p class="text-center">{{hint}}</p>
                <q-form>
                    <q-input
                        autofocus
                        class="q-mx-xl"
                        ref="pwd"
                        dense
                        input-class="text-center"
                        no-error-icon
                        :error="!!error"
                        :error-message="error"
                        v-model="inputValue"
                        outlined
                        type="password"
                        autocomplete="new-password"
                        @keydown.enter.prevent="onSubmit()"
                    />
                </q-form>
            </q-card-section>
            <q-card-actions>
                <q-btn
                    class="w40 q-mx-auto"
                    :label="action"
                    unelevated
                    color="primary"
                    @click="onSubmit()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'

const MIN_PASSWORD_LEN = 6

export default Vue.extend({
    data: () => {
        return {
            password: '',
            inputValue: '',
            error: ''
        }
    },
    computed: {
        hint() {
            return this.password ? 'Confirm the new password' : 'Enter the new password'
        },
        action() {
            return this.password ? 'Confirm' : 'Next'
        }
    },
    watch: {
        inputValue() { this.error = '' }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: string) {
            this.$emit('ok', result)
            this.hide()
        },
        async onSubmit() {
            if (this.inputValue.length === 0) {
                return
            }
            this.error = ''
            await this.$nextTick()
            if (this.password) {
                if (this.inputValue !== this.password) {
                    this.inputValue = ''
                    this.password = ''
                    await this.$nextTick()
                    this.error = 'Password mismatch'
                    return
                }
                this.ok(this.password)
            } else {
                if (this.inputValue.length < MIN_PASSWORD_LEN) {
                    this.error = 'Password too short (at least 6 chars)'
                    return
                }
                this.password = this.inputValue
                this.inputValue = ''
                void (this.$refs.pwd as Vue).$el.getElementsByTagName('input')[0].focus()
            }
        }
    }
})
</script>
