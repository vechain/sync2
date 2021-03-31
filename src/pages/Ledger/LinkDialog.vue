<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>Ledger</prompt-dialog-toolbar>
            <q-card-section>
                <q-item>
                    <q-item-section class="flex-center">
                        <q-img
                            width="60%"
                            src="~assets/ledger-device.svg"
                        />
                    </q-item-section>
                </q-item>
                <!-- steps -->
                <q-item
                    v-for="(s, i) in steps"
                    :key="i"
                    :class="{invisible: i > currentStepNum}"
                >
                    <q-item-section avatar>
                        <template v-if="i === currentStepNum">
                            <q-icon
                                v-if="error"
                                size="xs"
                                name="error"
                            />
                            <q-spinner v-else />
                        </template>
                        <q-icon
                            v-else-if="i < currentStepNum"
                            size="xs"
                            name="done"
                        />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label :class="{'text-grey': i >= currentStepNum}">
                            {{s.text}}
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <!-- hint -->
                <q-item>
                    <q-item-section>
                        <q-item-label
                            v-if="!!error"
                            class="text-negative"
                        >
                            {{error.message}}
                        </q-item-label>
                        <q-item-label v-else-if="currentStepNum<steps.length">
                            {{steps[currentStepNum].hint}}
                        </q-item-label>
                        <q-item-label v-else>
                            All looks good
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-card-section>
            <q-card-actions>
                <q-btn
                    v-disableFocusHelper
                    class="w40 q-mx-auto"
                    :disable="!account"
                    unelevated
                    color="primary"
                    label="Link"
                    @click="onSubmit()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import * as Ledger from 'src/utils/ledger'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'
import Deferred from 'src/utils/deferred'
import { sleep } from 'src/utils/sleep'

type Status = 'connected' | 'done'
type Step = {
    status: Status
    text: string
    hint: string
}

export default Vue.extend({
    components: {
        PromptDialogToolbar
    },
    data() {
        return {
            status: null as Status | null,
            account: null as Ledger.Account | null,
            error: null as Error | null
        }
    },
    computed: {
        steps(): Step[] {
            return [
                {
                    status: 'connected',
                    text: 'Connecting',
                    hint: 'Plug and unlock your Ledger'
                },
                {
                    status: 'done',
                    text: 'Reading data',
                    hint: 'Navigate to VeChain App'
                }
            ]
        },
        currentStepNum(): number {
            return this.steps.findIndex(s => s.status === this.status) + 1
        }
    },
    async mounted() {
        const signal = new Deferred<never>()
        this.$once('hook:beforeDestroy', () => {
            signal.reject(new Error('interrupted'))
        })

        for (; ;) {
            try {
                this.status = null
                const acc = await this.readAccount(signal)
                if (acc) {
                    this.account = acc
                    this.status = 'done'
                    return
                }
            } catch (err) {
                console.warn(err)
                if (process.env.MODE === 'spa' || process.env.MODE === 'pwa') {
                    this.error = err
                    return
                }
            }
            await Promise.race([sleep(2000), signal])
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: Ledger.Account) {
            this.$emit('ok', result)
            this.hide()
        },
        // read out account from ledger
        async readAccount(signal: Promise<never>) {
            let tr
            try {
                tr = await Ledger.connect()
                this.status = 'connected'
                const app = new Ledger.App(tr)
                try {
                    const acc = await Promise.race([
                        app.getAccount(Ledger.path, false, true),
                        signal
                    ])
                    return acc
                } catch {
                    // not in vechain app
                    return null
                }
            } finally {
                tr && await tr.close().catch(() => { })
            }
        },
        onSubmit() {
            this.account && this.ok(this.account)
        }
    }
})
</script>
