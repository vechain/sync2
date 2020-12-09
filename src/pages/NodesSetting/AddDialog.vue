<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        no-backdrop-dismiss
    >
        <q-card class="column full-width no-wrap">
            <q-card-section>
                <div class="text-h6">Add Node</div>
                <q-form @submit="onSubmit">
                    <q-input
                        label="URL"
                        :error="!!error"
                        :error-message="error"
                        v-model="url"
                        autocomplete="off"
                        no-error-icon
                        :disable="loading"
                    />
                    <div class="text-right q-mt-md">
                        <q-btn
                            v-close-popup
                            flat
                            class="q-mr-md"
                            label="Cancel"
                        />
                        <q-btn
                            flat
                            :loading="loading"
                            label="Add"
                            color="primary"
                            type="submit"
                        />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'

export default Vue.extend({
    data() {
        return {
            url: '',
            loading: false,
            error: ''
        }
    },
    watch: {
        url() { this.error = '' },
        '$stack.scoped'() { this.hide() }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },

        async onSubmit() {
            this.error = ''
            try {
                const urlObj = new URL(this.url)
                if (!['http:', 'https:'].includes(urlObj.protocol)) {
                    this.error = 'Invalid URL: unsupported protocol'
                    return
                }
            } catch (err) {
                this.error = err.message
                return
            }

            this.loading = true
            try {
                const resp = await this.$axios.get('blocks/0', {
                    baseURL: this.url
                })
                const node: M.Node = { genesis: resp.data, url: this.url }
                this.ok(node)
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        }
    }
})
</script>
