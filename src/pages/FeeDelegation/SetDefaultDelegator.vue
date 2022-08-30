<template>
    <q-dialog ref="dialog" @hide="$emit('hide')" :position="$q.screen.xs ? 'bottom' : 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs">
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{  $t('feeDelegation.set_default_delegator')  }}</prompt-dialog-toolbar>
            <q-form @submit="onSubmit" spellcheck="false">
                <q-card-section>
                    <q-item-label header>{{  $t('feeDelegation.enter_delegator_url')  }}</q-item-label>
                    <q-input ref="input" class="q-mx-sm" dense autofocus outlined :error="!!error"
                        :error-message="error" v-model="state.url" autocomplete="off" no-error-icon
                        :disable="loading" />
                </q-card-section>
                <q-card-actions>
                    <q-btn v-disableFocusHelper class="w40 q-mx-auto" unelevated color="primary" type="submit"
                        :loading="loading" :label="$t('common.confirm')" />
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
        state: Object as () => { url: string, signer?: string }
    },
    data() {
        return {
            loading: false,
            error: ''
        }
    },
    watch: {
        'state.url'() { this.error = '' }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(delegator: M.Delegator | undefined) {
            this.$emit('ok', delegator)
            this.hide()
        },
        async onSubmit() {
            const inputEl = (this.$refs.input as Vue).$el.getElementsByTagName('input')[0]
            inputEl.focus()

            const url = this.state.url.trim()
            if (url.length === 0) {
                return this.ok({ url: '' })
            }

            this.error = ''
            await this.$nextTick()

            try {
                const urlObj = new URL(url)
                if (!['http:', 'https:'].includes(urlObj.protocol)) {
                    throw new Error('Invalid URL: unsupported protocol')
                }

                this.ok({ url })
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
