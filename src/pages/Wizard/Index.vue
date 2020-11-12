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
            <div class="column fit q-pa-md">
                <h4 class="q-my-md q-px-md">Welcome</h4>
                <Tabs class="col column q-pb-xl q-pt-sm" />
                <div class="row items-center justify-center q-mt-auto">
                    <q-btn
                        class="col-6 col-sm-auto"
                        unelevated
                        color="blue-9"
                        label="Get Started"
                        @click="slide = 'setPin'"
                    />
                </div>
            </div>
        </q-carousel-slide>
        <q-carousel-slide
            name="setPin"
            class="q-pa-none"
        >
            <div class="q-pt-xl q-px-md">
                <h6 class="text-center q-mt-none">Enter Your Password</h6>
                <q-form @submit="onSubmit">
                    <InputPinCode v-model="code" />
                    <div class="text-caption text-grey">
                        If you forget the password, you will NOT be able to access Sync2.
                    </div>
                    <div class="row justify-center q-mt-lg">
                        <q-btn
                            class="col-6 col-sm-auto"
                            unelevated
                            color="blue-9"
                            type="submit"
                            label="Next"
                        />
                    </div>
                </q-form>
            </div>
        </q-carousel-slide>
        <q-carousel-slide
            class="q-pa-none column q-pt-xl items-center"
            name="process"
        >
            <ProcessingTransition
                :appear="true"
                style="max-width: 500px"
                class="q-px-md q-mt-xl"
                name="q-transition--jump-down"
                :sentences="steps"
            >
                <div class="row justify-center q-mt-lg">
                    <q-btn
                        class="col-6 col-sm-auto q-px-md q-mt-xl"
                        label="Done"
                        unelevated
                        v-if="createFinished"
                        @click="$emit('done')"
                        color="blue-9"
                    />
                </div>
            </ProcessingTransition>
        </q-carousel-slide>
    </q-carousel>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { Vault } from '../../core/vault'
import Tabs from './Tabs.vue'
const createSteps = [
    'Generating your VeChain wallet',
    'Generating random seed & entrophy',
    'Encrypting your wallet using your password',
    'Saving your encrypted keys to a local secure vault on this device',
    'Completed'
]
export default Vue.extend({
    components: {
        Tabs
    },
    data: () => {
        return {
            slide: 'welcome',
            code: '',
            steps: [] as string[],
            createFinished: false
        }
    },
    methods: {
        async onSubmit() {
            this.slide = 'process'
            this.steps = createSteps
            try {
                await this.initDB(this.code)
                this.createFinished = true
            } catch (error) {
                console.log(error)
                this.$q.notify({
                    type: 'warning',
                    message: 'Something wrong!',
                    timeout: 1500
                })
            }
        },
        async initDB(pin: string) {
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
        }
    }
})
</script>
