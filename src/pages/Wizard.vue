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
                    Sync designed to provide the superior user experiences for VeChain Apps,
                    and serves as the dApp enviroment to provide unlimited potential for developers and users.
                </div>
                <q-btn
                    class="q-mt-auto column"
                    color="primary"
                    label="Create New Wallet"
                    @click="slide = 'setPin'"
                />
            </div>
        </q-carousel-slide>
        <q-carousel-slide
            name="setPin"
            class="q-pa-none"
        >
            <div class="q-pt-xl q-px-md">
                <h6 class="text-center q-mt-none">Enter Your PIN</h6>
                <div>
                    This passcode is used to access your application and wallets. You can change the passcode in setting in future.
                </div>
                <q-form @submit="onSubmit">
                    <InputPinCode v-model="code" />
                    <div class="text-center q-mt-lg">
                        <q-btn
                            type="submit"
                            label="Next"
                            class="q-mt-md q-mx-auto"
                            color="teal"
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
