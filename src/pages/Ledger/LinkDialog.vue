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
                <Steps
                    :titles="steps.map(s => s.title)"
                    :step="currentStepNum"
                    :hint="hint"
                    :error="error"
                />
            </q-card-section>
            <q-card-actions>
                <q-btn
                    v-disableFocusHelper
                    class="w40 q-mx-auto"
                    :disable="!account"
                    unelevated
                    color="primary"
                    :label= "$t('ledger.label_link')"
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
import Steps from './Steps.vue'

type Status = 'connected' | 'done'
type Step = {
    status: Status
    title: string
    hint: string
}

export default Vue.extend({
    components: { PromptDialogToolbar, Steps },
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
                    title: this.$t('ledger.title_connecting').toString(),
                    hint: this.$t('ledger.msg_connecting').toString()
                },
                {
                    status: 'done',
                    title: this.$t('ledger.title_reading_data').toString(),
                    hint: this.$t('ledger.msg_checking_status').toString()
                }
            ]
        },
        currentStepNum(): number {
            return this.steps.findIndex(s => s.status === this.status) + 1
        },
        hint(): string {
            return this.currentStepNum < this.steps.length ? this.steps[this.currentStepNum].hint : ''
        }
    },
    async mounted() {
        const signal = new Deferred<never>()
        this.$once('hook:beforeDestroy', () => {
            signal.reject(new Error('interrupted'))
        })

        for (; ;) {
            let tr
            try {
                try {
                    // create transport
                    tr = await Ledger.connect()
                    this.status = 'connected'
                } catch (err) {
                    // transport error
                    console.warn(err)
                    if (process.env.MODE === 'spa' || process.env.MODE === 'pwa') {
                        // in chrome, user should have rejected
                        this.error = err
                        break
                    }
                    // retry
                    await Promise.race([sleep(2000), signal])
                    continue
                }

                const app = new Ledger.App(tr)
                try {
                    this.account = await Promise.race([
                        app.getAccount(Ledger.path, false, true),
                        signal
                    ])
                    this.status = 'done'
                } catch (err) {
                    // app error
                    console.warn(err)
                    // retry
                    await Promise.race([sleep(2000), signal])
                    continue
                }
            } finally {
                tr && await tr.close().catch(() => { })
            }
            break
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
        onSubmit() {
            this.account && this.ok(this.account)
        }
    }
})
</script>
