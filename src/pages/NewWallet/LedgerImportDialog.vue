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
                <transition-group
                    tag="div"
                    name="q-transition--jump-down"
                    class="column q-gutter-y-md no-wrap"
                >
                    <template v-for="(s, index) in summary">
                        <div
                            :key="s"
                            v-if=" step >= index"
                            :class="{'text-grey-7': step > index}"
                        >
                            {{s}}
                        </div>
                    </template>
                </transition-group>
            </q-card-section>
            <q-card-actions>
                <q-btn
                    v-disableFocusHelper
                    class="w40 q-mx-auto"
                    :disable="step !== status.done"
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
import Vet, { Account } from '@vechain/hw-app-vet'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

enum Status {
    waiting,
    connected,
    done
}
export default Vue.extend({
    components: {
        PromptDialogToolbar
    },
    data() {
        return {
            step: Status.waiting as number,
            account: null as Account | null,
            condition: true,
            status: Status,
            summary: ['Navigate to VeChain', 'Reading wallet']
        }
    },
    mounted() {
        this.onImport()
    },
    beforeDestroy() {
        this.condition = false
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: Account) {
            this.$emit('ok', result)
            this.hide()
        },
        async onImport() {
            let tr
            do {
                try {
                    tr = await Ledger.connect()
                    this.step = Status.connected
                    const vet = new Vet(tr)
                    try {
                        this.account = await vet.getAccount(Ledger.path, false, true)
                        this.step = Status.done
                        this.condition = false
                    } catch (error) {
                        this.step = Status.connected
                    }
                } catch (err) {
                    console.warn(err)
                    this.step = Status.waiting
                    this.condition = false
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
        },
        onSubmit() {
            if (this.account) {
                this.ok(this.account)
            } else {
                this.hide()
            }
        }
    }
})
</script>
