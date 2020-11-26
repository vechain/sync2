<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
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
                        :rules="[validateUrl]"
                        no-error-icon
                    />
                    <div class="text-right q-mt-md">
                        <q-btn
                            flat
                            class="q-mr-md"
                            label="Cancel"
                            @click="hide"
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
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        validateUrl(url: string) {
            let result = false
            if (url.startsWith('http')) {
                try {
                    const temp = new URL(url)
                    result = !!temp
                } catch (error) { }
            }

            return result || 'Invalid Url'
        },
        onSubmit() {
            this.error = ''
            this.loading = true
            this.$axios.get(`${this.url}/blocks/0`).then(r => {
                this.ok({ gid: r.data.id, url: this.url })
            }).catch(() => {
                this.error = 'Something wrong'
            }).finally(() => {
                this.loading = false
            })
        }
    }
})
</script>
