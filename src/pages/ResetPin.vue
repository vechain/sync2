<template>
    <div class="column fit">
        <page-toolbar title="Password" />
        <div
            v-if="show"
            class="q-pt-md q-px-md"
        >
            <div class="text-subtitle2">
                Password allows you to access Sync2 and unlock your wallet. If you forget the password, you will NOT be able to access Sync2.
            </div>
            <q-form @submit="onSubmit">
                <InputPinCode v-model="code" />
                <div class="text-center q-mt-lg">
                    <q-btn
                        type="submit"
                        label="Confirm"
                        class="q-mt-md full-width q-mx-auto"
                        color="blue-9"
                    ></q-btn>
                </div>
            </q-form>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from '../core/vault'
export default Vue.extend({
    data: () => {
        return {
            show: false,
            code: '',
            oldPin: ''
        }
    },
    methods: {
        async onSubmit() {
            await this.$loading(
                async () => {
                    try {
                        await this.updateDB(this.code)
                        this.$q.notify({
                            type: 'positive',
                            message: 'Password changed.',
                            timeout: 1500
                        })
                    } catch (error) {
                        console.log(error)
                        this.$q.notify({
                            type: 'warning',
                            message: 'Something wrong!',
                            timeout: 1500
                        })
                    } finally {
                        this.$router.back()
                    }
                }
            )
        },
        async updateDB(pin: string) {
            const newShadow = await Vault.shadowPassword(pin)
            return this.$svc.wallet.reEncryptAll(
                vault => {
                    return Vault.decode(vault)
                        .then(v => v.clone(this.oldPin, pin))
                        .then(v => v.encode())
                }, () => this.$svc.config.savePasswordShadow(newShadow))
        }
    },
    async created() {
        try {
            this.oldPin = await this.$authenticate((pin) => {
                return Promise.resolve(pin)
            })
            this.show = true
        } catch (error) {
            this.$router.back()
        }
    }
})
</script>
