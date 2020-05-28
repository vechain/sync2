<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show=""
        transition-hide=""
        seamless
    >
        <q-card>
            <confirmed-pin-code-input
                class="full-height"
                v-if="step===0"
                @fulfilled="handlePin($event)"
            />
            <div
                v-else
                class="full-width full-height column flex-center"
            >
                Creating wallet...
            </div>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { Vault } from 'core/vault'

export default Vue.extend({
    data: () => {
        return {
            step: 0
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        async handlePin(pin: string) {
            this.step++
            try {
                const words = await Vault.generateMnemonic()
                const vault = await Vault.createHD(words, pin)

                const node0 = await vault.derive(0)

                const meta: M.Wallet.Meta = {
                    name: 'my wallet',
                    addresses: [{ address: node0.address, visible: true }]
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
            this.ok({})
        }
    }
})
</script>
