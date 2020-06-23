<template>
    <q-carousel
        v-model="slide"
        vertical
        transition-prev="slide-down"
        transition-next="slide-up"
        animated
    >
        <q-carousel-slide
            name="setPin"
            class="q-pa-none"
        >
            <confirmed-pin-code-input
                class="full-height"
                @fulfilled="handlePin($event)"
            />
        </q-carousel-slide>
        <q-carousel-slide
            name="createWallet"
            class="column flex-center q-pa-none"
        >
            Creating wallet...
        </q-carousel-slide>
        <q-carousel-slide
            name="done"
            class="column flex-center q-pa-none"
        >
            Congrats!
            <q-btn @click="ok({})">OK</q-btn>
        </q-carousel-slide>
    </q-carousel>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { Vault } from 'core/vault'

export default Vue.extend({
    data: () => {
        return {
            slide: 'setPin'
        }
    },
    methods: {
        async handlePin(pin: string) {
            this.slide = 'createWallet'
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
                this.slide = 'done'
            } catch (err) {
                console.warn(err)
                alert('something wrong')
            }
        }
    }
})
</script>
