<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        :position="$q.screen.xs ? 'bottom': 'standard'"
        :no-backdrop-dismiss="!$q.screen.xs"
    >
        <q-card class="full-width">
            <prompt-dialog-toolbar>{{opts.title}}</prompt-dialog-toolbar>
            <q-form @submit="onSubmit">
                <q-card-section>
                    <q-item-label header>{{opts.message}}</q-item-label>
                    <q-input
                        ref="input"
                        class="q-mx-sm"
                        dense
                        autofocus
                        outlined
                        :error="!!error"
                        :error-message="error"
                        v-model="input"
                        autocomplete="off"
                        no-error-icon
                    />
                </q-card-section>
                <q-card-actions>
                    <q-btn
                        v-disableFocusHelper
                        class="w40 q-mx-auto"
                        unelevated
                        :color="opts.action.color"
                        type="submit"
                        :label="opts.action.label"
                    />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import PromptDialogToolbar from 'src/components/PromptDialogToolbar.vue'

export type PromptOptions = {
    title: string
    message: string
    modal: string
    action: {
        label: string
        color: string
    }
    validate: (input: string) => string
}

export default Vue.extend({
    components: { PromptDialogToolbar },
    props: {
        opts: Object as () => PromptOptions
    },
    data() {
        return {
            input: this.opts.modal,
            error: ''
        }
    },
    watch: {
        input() { this.error = '' }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(input: string) {
            this.$emit('ok', input)
            this.hide()
        },
        async onSubmit() {
            (this.$refs.input as Vue).$el.getElementsByTagName('input')[0].focus()

            const input = this.input
            if (input.length === 0) {
                return
            }

            this.error = ''
            await this.$nextTick()

            const error = this.opts.validate(input)
            if (error) {
                this.error = error
                return
            }
            this.ok(input)
        }
    }
})
</script>
