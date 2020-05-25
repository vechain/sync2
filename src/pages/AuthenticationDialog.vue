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
            <pin-code-input
                v-model="code"
                @fulfilled="runTask($event)"
            />
            <q-btn
                v-if="bioPassReady"
                :icon="bioAuthTypeIcon"
                @click="recallBioPass"
                flat
            />
            <q-space />
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { QSpinnerIos } from 'quasar'

export default Vue.extend({
    props: {
        task: { type: Function as unknown as () => (<T>(password: string) => Promise<T>) }
    },
    data: () => {
        return {
            bioPassReady: false,
            code: ''
        }
    },
    computed: {
        bioAuthTypeIcon() {
            if (this.$bioPass) {
                return this.$bioPass.authType === 'face' ? 'sentiment_satisfied' : 'fingerprint'
            }
            return ''
        }
    },
    methods: {
        show() { (this.$refs.dialog as any).show() },
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        async recallBioPass() {
            if (this.$bioPass) {
                try {
                    const password = await this.$bioPass.recall('recall password')
                    await this.runTask(password)
                } catch (err) {
                    console.warn(err)
                }
            }
        },
        async runTask(password: string) {
            try {
                this.$q.loading.show({ spinner: QSpinnerIos as unknown as Vue, delay: 100 })
                this.ok(await this.task(password))
            } catch (err) {
                this.code = ''
                console.log('run task error:', err)
            } finally {
                this.$q.loading.hide()
            }
        }
    },
    async created() {
        if (this.$bioPass) {
            try {
                this.bioPassReady = await this.$bioPass.has()
            } catch (err) {
                console.warn(err)
            }
        }
    }
})
</script>
