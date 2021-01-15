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
                    <!-- <q-btn
                        v-if="bioPassSaved"
                        flat
                        text-color="primary"
                        class="q-mt-lg"
                        :label="$t('authenticationDialog.action_faceID')"
                    /> -->
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { BioPass } from 'src/utils/bio-pass'
import { kdfDecrypt } from 'src/core/vault'

export default Vue.extend({
    data: () => {
        return {
            password: '',
            error: '',
            loading: false
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
        },
        async recallBioPass() {
            const bioPass = this.bioPass
            if (!bioPass) {
                return
            }

            try {
                const umkHex = await bioPass.recall('recall password')
                this.ok(Buffer.from(umkHex, 'hex'))
            } catch (err) {
                console.warn(err)
            }
        }
    }
})
</script>
