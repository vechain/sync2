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
            <p>Input the pin code</p>
            <div class="relative-position">
                <input
                    class="invisible-input absolute-full"
                    v-model="clearPin"
                    v-bind="inputBinds"
                >
                <pin-code
                    class="full-width full-height"
                    :for-id="inputBinds.id"
                    v-model="clearPin"
                    @fulfilled="runTask($event)"
                />
            </div>
            <p :class="{invisible: !wrong}">Incorrect Pin Code</p>
            <q-btn
                v-if="hasBioPass"
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

export default Vue.extend({
    props: {
        title: String,
        task: { type: Function as unknown as () => (<T>(password: string) => Promise<T>) }
    },
    data: () => {
        const inputId = `pin-${Date.now().toString(16)}`
        return {
            hasBioPass: false,
            clearPin: '', // used to clear pin
            wrong: false,
            inputBinds: {
                id: inputId,
                name: inputId,
                type: 'text',
                autocomplete: 'off',
                autocapitalize: 'off',
                autocorrect: 'off',
                // pattern="[0-9]*" and inputmode="numeric" are needed to bring up numeric keypad
                pattern: '[0-9]*',
                inputmode: 'numeric'
            }
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
    watch: {
        clearPin(newVal: string) {
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
            await this.$loading(async () => {
                try {
                    this.ok(await this.task(pin))
                } catch (err) {
                    this.clearPin = ''
                    this.wrong = true
                    console.log('run task error:', err)
                }
            })
        }
    },
    async created() {
        if (this.$bioPass) {
            try {
                this.hasBioPass = await this.$bioPass.has()
            } catch (err) {
                console.warn(err)
            }
        }
    }
})
</script>
