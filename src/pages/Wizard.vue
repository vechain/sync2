<template>
    <q-carousel
        v-model="slide"
        vertical
        transition-prev="slide-down"
        transition-next="slide-up"
        animated
    >
        <q-carousel-slide
            name="welcome"
            class="q-pa-none"
        >
            <div class="column fit q-pa-lg">
                <h4 class="column">Welcome</h4>
                <div class="column">
                    Sync 2 is the brand new designed cross-platform wallet which allows users better managing all VIP-180 tokens, interacting with all dApps acrossing all platforms.
                </div>
                <q-btn
                    class="q-mt-auto column"
                    color="primary"
                    label="Get Started"
                    @click="slide = 'setPin'"
                />
            </div>
        </q-carousel-slide>
        <q-carousel-slide
            name="setPin"
            class="q-pa-none"
        >
            <div class="q-pt-xl q-px-md">
                <h6 class="text-center q-mt-none">Enter Your Password</h6>
                <div class="text-subtitle2">
                    Password allows you to access Sync2 and unlock your wallet. If you forget the password, you will NOT be able to access Sync2. You will need to delete the app and restore the wallet with mnemonic words.
                </div>
                <q-form @submit="onSubmit">
                    <InputPinCode v-model="code" />
                    <div class="text-center q-mt-lg">
                        <q-btn
                            type="submit"
                            label="Next"
                            class="q-mt-md q-mx-auto full-width"
                            color="blue-9"
                        ></q-btn>
                    </div>
                </q-form>
            </div>
        </q-carousel-slide>
    </q-carousel>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { Vault } from '../core/vault'
export default Vue.extend({
    data: () => {
        return {
            slide: 'welcome',
            code: ''
        }
    },
    methods: {
        async onSubmit() {
            await this.$loading(
                async () => {
                    try {
                        await this.initDB(this.code)
                        this.$q.notify({
                            type: 'positive',
                            message: 'Wallet successfully created ',
                            timeout: 1500
                        })
                    } catch (error) {
                        console.log(error)
                        this.$q.notify({
                            type: 'warning',
                            message: 'Something wrong!',
                            timeout: 1500
                        })
                    }
                }
            )
        },
        async initDB(pin: string) {
            try {
                const words = await Vault.generateMnemonic()
                const vault = await Vault.createHD(words, pin)

                const node0 = await vault.derive(0)

                const meta: M.Wallet.Meta = {
                    name: 'My Wallet',
                    addresses: [node0.address]
                }

                const shadow = await Vault.shadowPassword(pin)

                await this.$storage.transaction(async () => {
                    await this.$state.config.set('passwordShadow', shadow)
                    await this.$storage.wallets.insert({
                        gid: this.$state.config.node.list[0].gid,
                        vault: vault.encode(),
                        meta: JSON.stringify(meta)
                    })
                })
            } catch (err) {
                console.warn(err)
                alert('something wrong')
            }
        }
    }
})
</script>
