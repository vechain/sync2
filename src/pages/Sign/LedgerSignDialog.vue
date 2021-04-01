<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{title}}</prompt-dialog-toolbar>
            <q-card-section>
                <q-item>
                    <q-item-section class="flex-center">
                        <q-img width="60%" src="~assets/ledger-device.svg" />
                    </q-item-section>
                </q-item>
                <transition-group
                    tag="div"
                    name="q-transition--jump-down"
                    class="column q-gutter-y-md no-wrap"
                >
                    <template v-for="(s, index) in summary">
                        <q-item
                            dense
                            :key="s"
                            v-if="step >= index"
                            :class="{'text-grey-7': step > index}"
                        >
                            <q-item-section avatar>
                                <template v-if="index === (step - 1)">
                                    <q-icon
                                        v-if="error"
                                        name="error"
                                        size="xs"
                                        class="text-negative"
                                    />
                                    <q-spinner v-else />
                                </template>
                                <q-icon
                                    v-else-if="step > index"
                                    size="xs"
                                    name="done"
                                />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label
                                    caption
                                    class="text-negative"
                                    v-if="index === (step - 1) && error"
                                >
                                    {{error}}
                                </q-item-label>
                                <q-item-label
                                    v-else-if="step > index"
                                    :class="{'text-grey': step > index}"
                                >
                                    {{s}}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </transition-group>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import Vet, { StatusCodes } from '@vechain/hw-app-vet'
import * as Ledger from 'src/utils/ledger'
import { Vault } from 'src/core/vault'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

enum Status {
    waiting,
    connected,
    checkSigner,
    approving,
    done
}

type arg = {
    signer: string,
    index: number,
    tx?: Buffer,
    cert?: Buffer
}
export default Vue.extend({
    components: {
        PromptDialogToolbar
    },
    props: {
        arg: Object as () => arg
    },
    data() {
        return {
            step: Status.waiting,
            error: '',
            condition: true,
            status: Status,
            summary: ['Navigate to VeChain', 'Checking signer address', 'Waiting for Approval']
        }
    },
    mounted() {
        this.signTx()
    },
    beforeDestroy() {
        this.condition = false
    },
    computed: {
        title(): string {
            return this.arg.tx ? 'Sign Tx' : 'Sign Cert'
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
        async signTx() {
            const { index, signer, tx, cert } = { ...this.arg }
            let tr
            do {
                try {
                    tr = await Ledger.connect()
                    this.step = Status.connected
                    const vet = new Vet(tr)
                    try {
                        const account = await vet.getAccount(Ledger.path, false, true)
                        this.step = Status.checkSigner
                        const vault = Vault.createUSB(Buffer.from(account.publicKey, 'hex'), Buffer.from(account.chainCode!, 'hex'))
                        const nodeI = vault.derive(this.arg.index)
                        if (signer.toLowerCase() === nodeI.address.toLowerCase()) {
                            this.step = Status.approving
                            const originSig = tx ? await vet.signTransaction(`${Ledger.path}/${index}`, tx) : await vet.signJSON(`${Ledger.path}/${index}`, cert!)
                            this.step = Status.done
                            this.ok(originSig)
                        } else {
                            this.condition = false
                            this.error = 'Not match'
                        }
                        this.step = Status.connected
                    } catch (error) {
                        console.log(error)
                        if (error.statusCode === StatusCodes.INCORRECT_DATA || error.statusCode === StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED) {
                            this.condition = false
                            this.error = error.message
                            this.step = Status.approving
                        } else {
                            this.step = Status.connected
                        }
                    }
                } catch (e) {
                    console.log(e)
                    this.step = Status.waiting
                    this.hide()
                } finally {
                    tr && tr.close()
                }
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve()
                    }, 1000)
                })
            } while (this.condition)
        }
    }
})
</script>
