<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">{{$t('authenticationDialog.title')}}</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <p class="text-center">{{$t('authenticationDialog.label_input_password')}}</p>
                <q-form>
                    <q-input
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
                        @keydown.enter.prevent="onSubmit()"
                    />
                </q-form>
            </q-card-section>
            <q-card-actions>
                <q-btn
                    class="w40 q-mx-auto"
                    :label="$t('authenticationDialog.action_unlock')"
                    unelevated
                    color="primary"
                    @click="onSubmit()"
                />
                <!-- <q-btn
                        v-if="bioPassSaved"
                        flat
                        text-color="primary"
                        class="q-mt-lg"
                        label="$t('authenticationDialog.action_faceID')"
                    /> -->
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { BioPass } from 'src/utils/bio-pass'
import { Vault } from 'core/vault'

export default Vue.extend({
    data: () => {
        return {
            password: '',
            error: ''
        }
    },
    computed: {
        bioAuthTypeIcon(): string {
            return this.bioPass
                ? (this.bioPass.authType === 'face' ? 'sentiment_satisfied' : 'fingerprint')
                : ''
        }
    },
    asyncComputed: {
        bioPass() {
            return BioPass.open()
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
        ok(result: string) {
            this.$emit('ok', result)
            this.hide()
        },
        onSubmit() {
            const password = this.password
            if (password.length === 0) {
                return
            }
            this.error = ''
            this.$loading(async () => {
                try {
                    const passwordShadow = await this.$svc.config.getPasswordShadow()
                    await Vault.verifyPassword(passwordShadow, password)
                    this.ok(password)
                } catch {
                    void (this.$refs.pwd as Vue).$el.getElementsByTagName('input')[0].select()
                    this.error = this.$t('authenticationDialog.msg_password_error').toString()
                }
            })
        },
        async recallBioPass() {
            const bioPass = this.bioPass
            if (!bioPass) {
                return
            }

            try {
                const password = await bioPass.recall('recall password')
                this.ok(password)
            } catch (err) {
                console.warn(err)
            }
        }
    }
})
</script>
