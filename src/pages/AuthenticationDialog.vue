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
            <p>Incorrect pin code</p>
            <pin-code-input
                v-model="clearPin"
                @fulfilled="runTask($event)"
            />
            <p :style="{visibility: wrong? 'visible': 'hidden'}">Incorrect Pin Code</p>
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
        return {
            hasBioPass: false,
            clearPin: '', // used to clear pin
            wrong: false
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
