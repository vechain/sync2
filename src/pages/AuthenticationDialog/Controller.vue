<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="column full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">Authenticate</q-toolbar-title>
            </q-toolbar>
            <q-form @submit="onSubmit()">
                <q-card-section>
                    <q-input
                        class="q-mx-lg"
                        ref="pwd"
                        label="Enter password to unlock"
                        dense
                        input-class="text-center"
                        no-error-icon
                        :error="!!error"
                        :error-message="error"
                        v-model="password"
                        outlined
                        type="password"
                    ></q-input>
                </q-card-section>
                <q-card-actions class="row justify-center">
                    <q-btn
                        class="col-6"
                        type="submit"
                        label="Unlock"
                        unelevated
                        color="primary"
                    />
                    <!-- <q-btn
                        v-if="bioPassSaved"
                        flat
                        text-color="primary"
                        class="q-mt-lg"
                        label="Unlock with FaceID"
                    /> -->
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
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
            return this.bioPassType === 'face' ? 'sentiment_satisfied' : 'fingerprint'
        }
    },
    asyncComputed: {
        async bioPassType(): Promise<BioPass['authType'] | null> {
            const bioPass = await BioPass.open()
            return bioPass ? bioPass.authType : null
        },
        async bioPassSaved(): Promise<boolean> {
            const bioPass = await BioPass.open()
            return bioPass ? await bioPass.saved() : false
        }
    },
    watch: {
        password() {
            this.error = ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: string) {
            this.$emit('ok', result)
            this.hide()
        },
        onSubmit() {
            const password = this.password
            this.$loading(async () => {
                try {
                    const passwordShadow = await this.$svc.config.getPasswordShadow()
                    await Vault.verifyPassword(passwordShadow, password)
                    this.ok(password)
                } catch {
                    void (this.$refs.pwd as Vue).$el.getElementsByTagName('input')[0].select()
                    this.error = 'Incorrect password'
                }
            })
        }
        // async recallBioPass() {
        //     const bioPass = await BioPass.open()
        //     if (bioPass) {
        //         try {
        //             const pin = await bioPass.recall('recall pin')
        //             await this.runTask(pin)
        //         } catch (err) {
        //             console.warn(err)
        //         }
        //     }
        // },
    }
})
</script>
