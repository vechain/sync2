<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
        tabindex="0"
    >
        <q-card class="column items-center no-wrap">
            <q-toolbar>
                <q-toolbar-title class="absolute-center">
                    {{args.title || 'Authenticate'}}
                </q-toolbar-title>
                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click="hide"
                />
            </q-toolbar>
            <p class="q-mt-md">Input your PIN to unlock</p>
            <q-form @submit="runTask(pin)" class="text-center q-mt-xl column">
                <q-input :error="wrong" error-message="Incorrect Pin Code" v-model="pin" outlined autocomplete="off" type="password"></q-input>
                <q-btn
                    type="submit"
                    label="Unlock"
                    class="q-mt-xl"
                    color="primary"
                />
                <q-btn v-if="bioPassSaved" flat text-color="primary" class="q-mt-lg" label="Unlock with FaceId" />
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
    props: {
        task: { type: Function as unknown as () => (<T>(password: string) => Promise<T>) },
        args: Object as () => AuthenticationDialog.Args
    },
    data: () => {
        return {
            bioPassType: null as BioPass['authType'] | null,
            bioPassSaved: false,
            pin: '',
            wrong: false
        }
    },
    computed: {
        bioAuthTypeIcon() {
            return this.bioPassType === 'face' ? 'sentiment_satisfied' : 'fingerprint'
        }
    },
    watch: {
        pin(newVal: string) {
            if (newVal) {
                this.wrong = false // clear wrong flag
            }
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        async recallBioPass() {
            const bioPass = await BioPass.open()
            if (bioPass) {
                try {
                    const pin = await bioPass.recall('recall pin')
                    await this.runTask(pin)
                } catch (err) {
                    console.warn(err)
                }
            }
        },
        runTask(pin: string) {
            return this.$loading(async () => {
                try {
                    await Vault.verifyPassword(this.$state.config.all.passwordShadow, pin)
                    this.ok(await this.task(pin))
                } catch (err) {
                    this.pin = ''
                    this.wrong = true
                    console.log('run task error:', err)
                }
            })
        }
    },
    async created() {
        const bioPass = await BioPass.open()
        if (bioPass) {
            this.bioPassType = bioPass.authType
            this.bioPassSaved = await bioPass.saved()
        }
    }
})
</script>
