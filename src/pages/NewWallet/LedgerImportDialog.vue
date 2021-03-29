<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>Import from ledger</prompt-dialog-toolbar>
            <q-card-section>
                <q-item
                    v-for="(s, i) in steps"
                    :key="i"
                    :class="{invisible: i > currentStepNum}"
                    dense
                >
                    <q-item-section avatar>
                        <template v-if="i === currentStepNum">
                            <q-icon
                                v-if="error"
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
                        <q-item-label :class="{'text-grey': i < currentStepNum}">
                            {{s.text}}
                        </q-item-label>
                        <q-item-label
                            v-if="i === currentStepNum && error"
                            caption
                            class="text-negative"
                        >
                            {{error.message}}
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
                    label="Import"
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

type Status = 'connected' | 'handshaked' | 'done'
type Step = { status: Status, text: string }

export default Vue.extend({
    components: {
        PromptDialogToolbar
    },
    data() {
        return {
            status: null as Status | null,
            account: null as Ledger.Account | null,
            error: null as Error | null,
            destroyed: false
        }
    },
    computed: {
        steps(): Step[] {
            return [
                { status: 'connected', text: 'Connect to Ledger' },
                { status: 'handshaked', text: 'Enter VeChain App' },
                { status: 'done', text: 'Read account' }
            ]
        },
        currentStepNum(): number {
            return this.steps.findIndex(s => s.status === this.status) + 1
        }
    },
    async mounted() {
        while (!this.destroyed) {
            try {
                const acc = await this.readAccount()
                this.status = 'connected'
                if (acc) {
                    this.account = acc
                    this.status = 'done'
                    return
                }
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch (err) {
                console.warn(err)
                if (process.env.MODE === 'spa' || process.env.MODE === 'pwa') {
                    this.error = err
                    return
                }
            }
        }
    },
    beforeDestroy() {
        this.destroyed = true
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
        async readAccount() {
            let tr
            try {
                tr = await Ledger.connect()
                // eslint-disable-next-line new-cap
                const app = new Ledger.App(tr)
                try {
                    return await app.getAccount(Ledger.path, false, true)
                } catch {
                    return null
                }
            } finally {
                tr && tr.close()
            }
        },
        onSubmit() {
            this.account && this.ok(this.account)
        }
    }
})
</script>
