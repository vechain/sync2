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
                    :disable="creating"
                >Cancel</q-btn>
                <q-toolbar-title class="absolute-center text-capitalize">
                    Create Wallet
                </q-toolbar-title>
            </q-toolbar>
            <div
                class="absolute-center"
                v-if="creating"
            >
                Creating...
            </div>
            <div
                v-else
                style="max-width: 500px"
                class="q-mx-auto"
            >
                <q-form class="q-px-md" @submit="onNew">
                    <q-input
                        v-model.trim="name"
                        :rules="[val => val.length > 0 || 'Give it a name!']"
                        label="Wallet Name"
                    />
                    <div class="q-mt-lg">Network</div>
                    <q-radio
                        v-for="item in nodes"
                        :key="item.gid"
                        v-model="gid"
                        class="text-capitalize"
                        :val="item.gid"
                        :label="item.gid | net"
                    />
                    <div class="text-center q-pt-xl">
                        <q-btn
                            unelevated
                            class="text-capitalize full-width"
                            color="blue-9"
                            type="submit"
                            label="Create"
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
            gid: '',
            words: '',
            creating: false
        }
    },
    computed: {
        nodes() {
            return this.$state.config.node.list
        }
    },
    created() {
        this.gid = this.nodes[0].gid
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
        async onNew() {
            try {
                const pin = await this.$authenticate(pin => Promise.resolve(pin))
                this.creating = true
                const words = await Vault.generateMnemonic()
                const vault = await Vault.createHD(words, pin)
                const node0 = await vault.derive(0)
                const meta: M.Wallet.Meta = {
                    name: this.name,
                    addresses: [node0.address]
                }

                await this.$storage.wallets.insert({
                    gid: this.gid,
                    vault: vault.encode(),
                    meta: JSON.stringify(meta)
                })
                this.ok({})
                this.$q.notify(`New wallet ${this.name} created`)
            } catch (e) {
                console.warn(e)
            } finally {
                this.creating = false
            }
        }
    }
})
</script>
