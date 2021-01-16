<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">{{hint}}</q-toolbar-title>
            </q-toolbar>
            <q-form @submit="onSubmit()">
                <q-card-section>
                    <!-- prevent chrome warning -->
                    <q-input
                        v-show="false"
                        autocomplete="username"
                    />
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
                    />
                </q-card-section>
                <q-card-actions>
                    <q-btn
                        v-disableFocusHelper
                        class="w40 q-mx-auto"
                        :label="action"
                        unelevated
                        color="primary"
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
            return this.password ? this.$t('newPasswordDialog.title_confirm_password') : this.$t('newPasswordDialog.title_set_new_password')
        },
        action() {
            return this.password ? this.$t('common.confirm') : this.$t('common.next')
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
            (this.$refs.pwd as Vue).$el.getElementsByTagName('input')[0].focus()

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
                    this.error = this.$t('newPasswordDialog.msg_password_mismatch').toString()
                    return
                }
                this.ok(this.password)
            } else {
                if (this.inputValue.length < MIN_PASSWORD_LEN) {
                    this.error = this.$t('newPasswordDialog.msg_password_too_short').toString()
                    return
                }
                this.password = this.inputValue
                this.inputValue = ''
            }
        }
    }
})
</script>
