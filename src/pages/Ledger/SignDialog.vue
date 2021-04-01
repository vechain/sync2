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
                    :titles="steps.map(s=> s.title)"
                    :step="currentStepNum"
                    :hint="hint"
                    :error="error"
                />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import * as Ledger from 'src/utils/ledger'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'
import { HDNode } from 'thor-devkit'
import Deferred from 'src/utils/deferred'
import { sleep } from 'src/utils/sleep'
import Steps from './Steps.vue'

type Status = 'connected' | 'handshaked' | 'signed'
type Step = {
    status: Status
    title: string
    hint: string
}

type Arg = {
    signer: string,
    index: number,
    tx?: Buffer,
    cert?: Buffer
}

export default Vue.extend({
    components: { PromptDialogToolbar, Steps },
    props: {
        arg: Object as () => Arg
    },
    data() {
        return {
            status: null as Status | null,
            error: null as Error | null
        }
    },
    computed: {
        steps(): Step[] {
            return [
                {
                    status: 'connected',
                    title: 'Connecting',
                    hint: 'Plug and unlock your Ledger'
                },
                {
                    status: 'handshaked',
                    title: 'Checking status',
                    hint: 'Navigate to VeChain App'
                },
                {
                    status: 'signed',
                    title: 'Signing data',
                    hint: 'Confirm on your Ledger'
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

        const { index, signer, tx, cert } = { ...this.arg }

        for (; ;) {
            let tr
            try {
                // create transport
                try {
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
                // get account and verify device
                try {
                    const acc = await Promise.race([
                        app.getAccount(Ledger.path, false, true),
                        signal
                    ])
                    const root = HDNode.fromPublicKey(Buffer.from(acc.publicKey, 'hex'), Buffer.from(acc.chainCode!, 'hex'))
                    const node = root.derive(index)

                    if (signer.toLowerCase() !== node.address.toLowerCase()) {
                        // not the expected ledger
                        this.error = new Error('wrong device')
                        break
                    }
                    this.status = 'handshaked'
                } catch (err) {
                    // app error
                    console.warn(err)
                    // retry
                    await Promise.race([sleep(2000), signal])
                    continue
                }

                // sign
                try {
                    const path = `${Ledger.path}/${index}`
                    if (tx) {
                        const sig = await Promise.race([
                            app.signTransaction(path, tx),
                            signal
                        ])
                        this.status = 'signed'
                        await sleep(1000)
                        this.$emit('ok', sig)
                    } else if (cert) {
                        const sig = await Promise.race([
                            app.signJSON(path, cert),
                            signal
                        ])
                        this.status = 'signed'
                        await sleep(1000)
                        this.$emit('ok', sig)
                    } else {
                        this.error = new Error('unknown data type')
                    }
                } catch (err) {
                    // TODO to check error status code to judge config problem
                    console.warn(err)
                    this.error = err
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
        ok(result: Buffer) {
            this.$emit('ok', result)
            this.hide()
        }
    }
})
</script>
