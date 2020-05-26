<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column items-center">
            <q-toolbar>
                <q-toolbar-title>
                    {{title || 'Authenticate'}}
                </q-toolbar-title>
                <q-btn
                    flat
                    @click="hide"
                >Cancel</q-btn>
            </q-toolbar>
            <q-space />
            <p>{{message}}</p>
            <template v-if="resetMode">
                <pin-code-input
                    v-model="clear"
                    @fulfilled="handlePin($event)"
                />
            </template>
            <template v-else>
                <pin-code-input
                    v-model="clear"
                    @fulfilled="runTask($event)"
                />
                <q-btn
                    v-if="bioPassReady"
                    :icon="bioAuthTypeIcon"
                    @click="recallBioPass"
                    flat
                />
            </template>
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
        title: String,
        resetMode: Boolean,
        task: { type: Function as unknown as () => (<T>(password: string) => Promise<T>) }
    },
    data: () => {
        return {
            bioPassReady: false,
            clear: '', // used to clear pin
            pin1: ''
        }
    },
    computed: {
        bioAuthTypeIcon() {
            if (this.$bioPass) {
                return this.$bioPass.authType === 'face' ? 'sentiment_satisfied' : 'fingerprint'
            }
            return ''
        },
        message() {
            if (this.resetMode) {
                return this.pin1
                    ? 'Confirm the new pin code'
                    : 'Input your new pin code'
            } else {
                return 'Input your pin code'
            }
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
                    const pin = await this.$bioPass.recall('recall pin')
                    await this.runTask(pin)
                } catch (err) {
                    console.warn(err)
                }
            }
        },
        async runTask(pin: string) {
            try {
                this.$q.loading.show({ spinner: QSpinnerIos as unknown as Vue, delay: 100 })
                this.ok(await this.task(pin))
            } catch (err) {
                this.clear = ''
                console.log('run task error:', err)
            } finally {
                this.$q.loading.hide()
            }
        },
        handlePin(pin: string) {
            if (!this.pin1) {
                this.pin1 = pin
                this.clear = ''
            } else {
                if (this.pin1 === pin) {
                    this.runTask(pin)
                } else {
                    this.pin1 = ''
                    this.clear = ''
                }
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
