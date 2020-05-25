<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column items-center overflow-auto">
            <q-toolbar>
                <q-toolbar-title>
                    Authenticate
                </q-toolbar-title>
                <q-btn
                    flat
                    @click="hide"
                >Cancel</q-btn>
            </q-toolbar>
            <q-space />
            <pin-code-input @input="ok($event)" />
            <q-btn
                :icon="$bioPass.authType==='face'?'sentiment_satisfied': 'fingerprint'"
                v-if="hasBioPass===true"
                @click="bioPassRecall"
                flat
            />
            <q-space />
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'

export default Vue.extend({
    data: () => {
        return {
            hasBioPass: null as boolean | null
        }
    },
    methods: {
        show() { (this.$refs.dialog as any).show() },
        hide() { (this.$refs.dialog as any).hide() },
        ok(password: string) {
            this.$emit('ok', { password })
            this.hide()
        },
        async bioPassRecall() {
            if (this.$bioPass) {
                try {
                    const password = await this.$bioPass.recall('recall password')
                    this.ok(password)
                } catch (err) {
                    console.warn(err)
                }
            }
        }
    },
    async created() {
        if (this.$bioPass) {
            try {
                this.hasBioPass = await this.$bioPass.has()
            } catch (err) {
                console.warn(err)
            }
        } else {
            this.hasBioPass = false
        }
    }
})
</script>
