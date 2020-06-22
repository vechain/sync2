<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <!-- toolbar -->
            <q-toolbar>
                <q-btn
                    flat
                    @click="hide"
                    :disable="importing"
                >Cancel</q-btn>
                <q-toolbar-title class="absolute-center text-capitalize">
                    Import Wallet
                </q-toolbar-title>
            </q-toolbar>
            <div
                class="absolute-center"
                v-if="importing"
            >
                Importing...
            </div>
            <div
                v-else
                style="max-width: 500px"
                class="q-mx-auto"
            >
                <q-form class="q-px-md">
                    <q-input
                        v-model.trim="name"
                        :rules="[val => val.length > 0 || 'Give it a name!']"
                        label="Wallet Name"
                    />
                    <div class="q-mt-lg">Network</div>
                    <q-radio
                        v-for="item in nodes"
                        :key="item.gid"
                        v-model="network"
                        :val="item.gid"
                        class="text-capitalize"
                        :label="item.gid | net"
                    />

                    <q-input
                        type="textarea"
                        v-model.trim="words"
                        label="Mnemonic phrases"
                        hint="Input the mnemonic phrases and seperated by single space"
                    />

                    <div class="text-center q-pt-md">
                        <q-btn
                            unelevated
                            size="sm"
                            color="black"
                            @click="onImport"
                            class="text-capitalize"
                            label="Import"
                        ></q-btn>
                    </div>
                </q-form>
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
            name: '',
            network: '',
            words: '',
            importing: false
        }
    },
    computed: {
        nodes() {
            return this.$state.config.node.list
        }
    },
    created() {
        this.network = this.nodes[0].gid
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
        async onImport() {
            try {
                const pin = await this.$authenticate(pin => Promise.resolve(pin))
                this.importing = true
                const words = this.words.split(' ')
                const vault = await Vault.createHD(words, pin)
                const node0 = await vault.derive(0)
                const meta: M.Wallet.Meta = {
                    name: this.name,
                    addresses: [node0.address]
                }

                await this.$storage.wallets.insert({
                    gid: this.network,
                    vault: vault.encode(),
                    meta: JSON.stringify(meta)
                })
                this.ok({})
                this.$q.notify(`Wallet ${this.name} was imported`)
            } catch (e) { console.warn(e) } finally {
                this.importing = false
            }
        }
    }
})
</script>
