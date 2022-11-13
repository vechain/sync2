<template>
    <q-dialog ref="dialog" @hide="$emit('hide')" :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs">
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{ $t('newWallet.action_import') }}</prompt-dialog-toolbar>
            <q-card-section>
                <q-input ref="input" autofocus v-model="state.address" :label="$t('newMultiSig.label_address')"
                    type="input" outlined :error="!!error" :error-message="error" no-error-icon />
            </q-card-section>
            <q-card-actions>
                <q-btn v-disableFocusHelper class="w40 q-mx-auto" unelevated color="primary" :label="$t('common.ok')"
                    @click="onSubmit()" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { address } from 'thor-devkit'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

export default Vue.extend({
    components: { PromptDialogToolbar },
    props: {
        state: Object as () => { address: string }
    },
    data: () => {
        return {
            address: '',
            error: ''
        }
    },
    watch: {
        'state.address'() {
            this.error = ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: string) {
            this.$emit('ok', result)
            this.hide()
        },
        checkSumAddress(v: string): boolean {
            return !(v !== v.toLowerCase() && address.toChecksumed(v) !== v)
        },
        async onSubmit() {
            this.error = ''
            await this.$nextTick()
            this.error = address.test(this.state.address)
                ? this.checkSumAddress(this.state.address) ? '' : this.$t('newMultiSig.msg_invalid_address_checksum').toString()
                : this.$t('newMultiSig.msg_invalid_address').toString()

            if (this.error === '') {
                this.ok(this.state.address)
            }
        }
    }
})
</script>
