<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{hint}}</prompt-dialog-toolbar>
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
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

const MIN_PASSWORD_LEN = 6

export default Vue.extend({
    components: { PromptDialogToolbar },
    data: () => {
        return {
            password: '',
            inputValue: '',
            error: ''
        }
    },
    computed: {
        hint(): string {
            return this.password
                ? this.$t('newPasswordDialog.title_confirm_password').toString()
                : this.$t('newPasswordDialog.title_set_new_password').toString()
        },
        action(): string {
            return this.password
                ? this.$t('common.confirm').toString()
                : this.$t('common.next').toString()
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
