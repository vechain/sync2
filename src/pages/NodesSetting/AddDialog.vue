<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">{{$t('nodes.title_add_dialog')}}</q-toolbar-title>
            </q-toolbar>
            <q-form @submit="onSubmit">
                <q-card-section>
                    <q-item-label header>URL</q-item-label>
                    <q-input
                        ref="input"
                        class="q-mx-sm"
                        dense
                        autofocus
                        outlined
                        :error="!!error"
                        :error-message="error"
                        v-model="state.url"
                        autocomplete="off"
                        no-error-icon
                        :disable="loading"
                    />
                </q-card-section>
                <q-card-actions>
                    <q-btn
                        class="w40 q-mx-auto"
                        unelevated
                        color="primary"
                        type="submit"
                        :loading="loading"
                        :label="$t('common.add')"
                    />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'

export default Vue.extend({
    props: {
        state: Object as () => { url: string }
    },
    data() {
        return {
            loading: false,
            error: ''
        }
    },
    watch: {
        'state.url'() { this.error = '' },
        error(newVal: string) {
            if (newVal) {
                this.$nextTick(() => {
                    (this.$refs.input as Vue).$el.getElementsByTagName('input')[0].focus()
                })
            }
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: M.Node) {
            this.$emit('ok', result)
            this.hide()
        },
        async onSubmit() {
            const url = this.state.url.trim()
            if (url.length === 0) {
                this.error = 'Input the URL of node'
                return
            }
            this.error = ''
            try {
                const urlObj = new URL(url)
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
                    baseURL: url
                })
                this.ok({ genesis: resp.data, url })
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        }
    }
})
</script>
