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
        async onSubmit() {
            const inputEl = (this.$refs.input as Vue).$el.getElementsByTagName('input')[0]
            inputEl.focus()

            const address = this.state.address.trim()
            if (address.length === 0) {
                return
            }

            this.error = ''
            await this.$nextTick()

            try {
                this.loading = true
                this.ok(address)
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
