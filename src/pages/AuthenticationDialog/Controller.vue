<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{$t('authenticationDialog.title')}}</prompt-dialog-toolbar>
            <q-form @submit="onSubmit()">
                <q-card-section>
                    <p class="text-center">{{$t('authenticationDialog.label_input_password')}}</p>
                    <!-- prevent chrome warning -->
                    <q-input
                        v-show="false"
                        autocomplete="username"
                    />
                    <q-input
                        :disable="loading"
                        autofocus
                        class="q-mx-lg"
                        ref="pwd"
                        dense
                        input-class="text-center"
                        no-error-icon
                        :error="!!error"
                        :error-message="error"
                        v-model="password"
                        outlined
                        type="password"
                        autocomplete="current-password"
                    />
                </q-card-section>
                <q-card-actions>
                    <q-btn
                        v-disableFocusHelper
                        :loading="loading"
                        class="w40 q-mx-auto"
                        :label="$t('authenticationDialog.action_unlock')"
                        unelevated
                        color="positive"
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
import { kdfDecrypt } from 'src/core/vault'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

export default Vue.extend({
    components: { PromptDialogToolbar },
    data: () => {
        return {
            password: '',
            error: '',
            loading: false
        }
    },
    watch: {
        password() {
            this.error = ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(umk: Buffer) {
            this.$emit('ok', umk)
            this.hide()
        },
        async onSubmit() {
            const inputEl = (this.$refs.pwd as Vue).$el.getElementsByTagName('input')[0]
            inputEl.focus()

            const password = this.password
            if (password.length === 0) {
                return
            }
            this.error = ''
            try {
                this.loading = true
                const glob = await this.$svc.config.getUserMasterKeyGlob()
                const umk = await kdfDecrypt(JSON.parse(glob), password)
                this.ok(umk)
            } catch {
                this.loading = false
                this.error = this.$t('authenticationDialog.msg_password_error').toString()
                await this.$nextTick()
                inputEl.focus()
            }
        }
    }
})
</script>
