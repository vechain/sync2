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
                style="max-width: 500px"
                class="q-mx-auto"
            >
                <q-form
                    class="q-px-md"
                    @submit="onImport"
                >
                    <q-input
                        v-model.trim="name"
                        autofocus
                        no-error-icon
                        autocomplete="off"
                        :rules="[val => val.length > 0 || 'Give it a name!']"
                        label="Wallet Name"
                    />
                    <div class="q-mt-lg">Network</div>
                    <q-radio
                        v-for="item in nodes"
                        :key="item.gid"
                        v-model="gid"
                        :val="item.gid"
                        class="text-capitalize"
                        :label="item.gid | net"
                    />

                    <q-input
                        type="textarea"
                        no-error-icon
                        v-model.trim="words"
                        label="Mnemonic Words"
                        hint="Enter the mnemonic words and seperated by single space"
                        :rules="[
                            val => val && val.length > 0 || 'Please enter mnemonic words',
                            val => checkMnemonic(val) || 'Invalid mnemonic words'
                        ]"
                    />

                    <div class="row q-mt-xl justify-center">
                        <q-btn
                            unelevated
                            :disable="importing"
                            class="text-capitalize col-6 col-sm-auto"
                            color="blue-9"
                            type="submit"
                            label="Import"
                        />
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
import { mnemonic } from 'thor-devkit'

export default Vue.extend({
    data: () => {
        return {
            name: '',
            gid: '',
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
        this.gid = this.nodes[0].genesis.id
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
        checkMnemonic(words: string) {
            return mnemonic.validate(words.split(' '))
        },
        async onImport() {
            const pin = await this.$authenticate(pin => Promise.resolve(pin))
            this.$loading(async () => {
                this.importing = true
                try {
                    const words = this.words.split(' ')
                    const vault = await Vault.createHD(words, pin)
                    const node0 = await vault.derive(0)
                    const meta: M.Wallet.Meta = {
                        name: this.name,
                        addresses: [node0.address],
                        backedUp: true
                    }

                    await this.$storage.wallets.insert({
                        gid: this.gid,
                        vault: vault.encode(),
                        meta: JSON.stringify(meta)
                    })
                    this.$q.notify({
                        type: 'positive',
                        message: 'Wallet successfully imported ',
                        timeout: 1500
                    })
                    this.hide()
                } catch (e) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Something wrong!',
                        timeout: 1500
                    })
                } finally {
                    this.importing = false
                }
            })
        }
    }
})
</script>
