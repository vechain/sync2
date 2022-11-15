<template>
    <q-dialog ref="dialog" @hide="$emit('hide')" :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs">
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{ $t('ownerMultiSig.title_add_dialog') }}</prompt-dialog-toolbar>
            <q-form @submit="onSubmit" spellcheck="false">
                <q-card-section>
                    <q-input ref="input" class="q-mx-sm" dense autofocus outlined :error="!!error"
                        :error-message="error" v-model="state.address" autocomplete="off" no-error-icon
                        :disable="loading" />
                </q-card-section>
                <q-card-actions>
                    <q-btn v-disableFocusHelper class="w40 q-mx-auto" unelevated color="primary" type="submit"
                        :loading="loading" :label="$t('common.add')" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'
import { address } from 'thor-devkit'

export default Vue.extend({
    components: { PromptDialogToolbar },
    props: {
        state: Object as () => { address: string }
    },
    data() {
        return {
            loading: false,
            error: ''
        }
    },
    watch: {
        'state.address'() { this.error = '' }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(address: string) {
            this.$emit('ok', address)
            this.hide()
        },
        isAddress: address.test,
        checkSumAddress(v: string): boolean {
            return !(v !== v.toLowerCase() && address.toChecksumed(v) !== v)
        },
        validate(): boolean {
            this.error = this.isAddress(this.state.address)
                ? this.checkSumAddress(this.state.address) ? '' : this.$t('send.msg_invalid_address_checksum').toString()
                : this.$t('send.msg_invalid_address').toString()

            return !this.error
        },
        async onSubmit() {
            const inputEl = (this.$refs.input as Vue).$el.getElementsByTagName('input')[0]
            inputEl.focus()

            if (!this.validate()) {
                return
            }

            this.error = ''
            await this.$nextTick()

            try {
                this.loading = true
                this.ok(this.state.address)
            } catch (err) {
                this.error = err.message
                this.loading = false
                await this.$nextTick()
                inputEl.focus()
            }
        }
    }
})
</script>
