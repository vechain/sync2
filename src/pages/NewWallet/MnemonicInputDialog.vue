<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{$t('newWallet.action_import')}}</prompt-dialog-toolbar>
            <q-card-section>
                <q-input
                    ref="input"
                    autofocus
                    v-model="state.words"
                    :label="$t('newWallet.label_mnemonic')"
                    type="textarea"
                    outlined
                    :error="!!error"
                    :error-message="error"
                    no-error-icon
                />
            </q-card-section>
            <q-card-actions>
                <q-btn
                    v-disableFocusHelper
                    class="w40 q-mx-auto"
                    unelevated
                    color="primary"
                    :label="$t('common.ok')"
                    @click="onSubmit()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { mnemonic } from 'thor-devkit'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

export default Vue.extend({
    components: { PromptDialogToolbar },
    props: {
        state: Object as () => { words: string }
    },
    data: () => {
        return {
            error: ''
        }
    },
    watch: {
        'state.words'() {
            this.error = ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: string[]) {
            this.$emit('ok', result)
            this.hide()
        },
        async onSubmit() {
            const inputEl = (this.$refs.input as Vue).$el.getElementsByTagName('textarea')[0]
            inputEl.focus()

            const words = this.state.words
                .trim()
                .toLowerCase()

            if (words.length < 1) {
                return
            }

            this.error = ''
            await this.$nextTick()

            try {
                const array = words.split(/\s+/)
                if (array.length < 12 || !mnemonic.validate(array)) {
                    throw new Error()
                }
                this.ok(array)
            } catch {
                this.error = this.$t('newWallet.msg_mnemonic_error').toString()
            }
        }
    }
})
</script>
