<template>
    <div
        v-if="show"
        class="q-pt-md q-px-md"
    >
        <div>
            If you forget your passcode you will be unable to access the application unless you delete the application.
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
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from '../core/vault'
export default Vue.extend({
    data() {
        return {
            show: false,
            code: '',
            oldPin: ''
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
    },
    methods: {
        async onSubmit() {
            await this.$loading(
                async () => {
                    try {
                        await this.updateDB(this.code)
                        this.$q.notify({
                            type: 'positive',
                            message: 'Master code changed.',
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
            await this.$storage.transaction(async () => {
                const wallets = await this.$storage.wallets.all().query()
                const shadow = await this.$storage.waitFor(Vault.shadowPassword(pin))
                await this.$storage.configs.update({ key: 'passwordShadow' }, {
                    value: shadow
                })
                for (let i = 0; i < wallets.length; i++) {
                    const w = wallets[i]
                    const vault = await this.$storage.waitFor(Vault.decode(w.vault))
                    const words = await this.$storage.waitFor(vault.decrypt(this.oldPin)) as string
                    const newVault = await this.$storage.waitFor(Vault.createHD(words.split(' '), pin))
                    await this.$storage.wallets.update({ id: w.id }, {
                        vault: newVault.encode()
                    })
                }
            })
        }
    }
})
</script>
