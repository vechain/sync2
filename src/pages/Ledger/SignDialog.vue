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

type Status = 'connected' | 'handshaked' | 'signed'
type Step = {
    status: Status
    text: string
    hint: string
}

type Arg = {
    signer: string,
    index: number,
    tx?: Buffer,
    cert?: Buffer
}

export default Vue.extend({
    components: { PromptDialogToolbar },
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
                    text: 'Connecting',
                    hint: 'Plug and unlock your Ledger'
                },
                {
                    status: 'handshaked',
                    text: 'Checking wallet address',
                    hint: ''
                },
                {
                    status: 'signed',
                    text: 'Signing data',
                    hint: 'Confirm on your Ledger'
                }
            ]
        },
        currentStepNum(): number {
            return this.steps.findIndex(s => s.status === this.status) + 1
        },
        title(): string {
            return this.arg.tx ? 'Sign Tx' : 'Sign Cert'
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
                const sig = await this.sign(signal)
                if (sig) {
                    this.status = 'signed'
                    await sleep(1000)
                    this.$emit('ok', sig)
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
        ok(result: Buffer) {
            this.$emit('ok', result)
            this.hide()
        },
        async sign(signal: Promise<never>) {
            const { index, signer, tx, cert } = { ...this.arg }
            let tr
            try {
                tr = await Ledger.connect()
                this.status = 'connected'
                const app = new Ledger.App(tr)
                let acc
                try {
                    acc = await Promise.race([
                        app.getAccount(Ledger.path, false, true),
                        signal
                    ])
                } catch {
                    // not in vechain app
                    return null
                }

                const root = HDNode.fromPublicKey(Buffer.from(acc.publicKey, 'hex'), Buffer.from(acc.chainCode!, 'hex'))
                const node = root.derive(index)

                if (signer.toLowerCase() !== node.address.toLowerCase()) {
                    // interrupt
                    throw new Error('address mismatch')
                }
                this.status = 'handshaked'

                const path = `${Ledger.path}/${this.arg.index}`
                if (tx) {
                    return await Promise.race([
                        app.signTransaction(path, tx),
                        signal
                    ])
                } else if (cert) {
                    return await Promise.race([
                        app.signJSON(path, cert),
                        signal
                    ])
                } else {
                    throw new Error('invalid request')
                }
            } finally {
                tr && await tr.close().catch(() => { })
            }
        }
    }
})
</script>
