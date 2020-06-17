<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column items-center">
            <!-- toolbar -->
            <q-toolbar>
                <q-toolbar-title class="absolute-center">
                    New Wallet
                </q-toolbar-title>
                <q-btn
                    flat
                    @click="hide"
                    :disable="creating"
                >Cancel</q-btn>
                <q-space />
                <q-btn
                    flat
                    :disable="!name || creating"
                    @click="onClickConfirm"
                >Confirm
                </q-btn>
            </q-toolbar>
            <q-space />
            <!-- progress -->
            <p
                class="text-h5"
                v-if="creating"
            >Creating...</p>
            <!-- name input -->
            <template v-else>
                <p class="text-subtitle1">Wallet Name</p>
                <input
                    v-model="name"
                    type="text"
                    size="20"
                >
            </template>
            <q-space />
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
            name: '',
            creating: false
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
        async onClickConfirm() {
            const pin = await this.$authenticate(pin => Promise.resolve(pin))

            try {
                this.creating = true
                const words = await Vault.generateMnemonic()
                const vault = await Vault.createHD(words, pin)
                const node0 = await vault.derive(0)
                const meta: M.Wallet.Meta = {
                    name: this.name,
                    addresses: [node0.address]
                }

                await this.$storage.wallets.insert({
                    gid: this.$state.config.node.list[0].gid, // TODO let user select
                    vault: vault.encode(),
                    meta: JSON.stringify(meta)
                })
                this.ok({})
                this.$q.notify(`New wallet ${this.name} created`)
            } finally {
                this.creating = false
            }
        }
    }
})
</script>
