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
                    :disable="!!steps.length"
                >Cancel</q-btn>
                <q-toolbar-title class="absolute-center text-capitalize">
                    Create Wallet
                </q-toolbar-title>
            </q-toolbar>
            <div
                class="absolute fit q-pt-lg"
                v-if="steps.length"
            >
                <ProcessingTransition
                    :appear="true"
                    style="max-width: 500px"
                    class="q-mx-auto q-px-lg relative-position"
                    name="q-transition--jump-down"
                    :sentences="steps"
                >
                    <q-btn
                        class="item-center q-px-md"
                        label="Done"
                        v-if="createFinished"
                        @click="ok({})"
                        color="blue-9"
                    />
                </ProcessingTransition>
            </div>
            <div
                v-else
                style="max-width: 500px"
                class="q-mx-auto"
            >
                <q-form
                    class="q-px-md"
                    @submit="onNew"
                >
                    <q-input
                        v-model.trim="name"
                        autofocus
                        no-error-icon
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
                            :disable="createFinished"
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
const createSteps = [
    'Generating your VeChain wallet',
    'Generating random seed & entrophy',
    'Encrypting your wallet using your password',
    'Saving your encrypted keys to a local secure vault on this device',
    'Completed'
]
export default Vue.extend({
    data: () => {
        return {
            name: '',
            gid: '',
            words: '',
            steps: [] as unknown as string[],
            createFinished: false
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
                this.steps = createSteps

                const words = await Vault.generateMnemonic()
                const vault = await Vault.createHD(words, pin)
                const node0 = await vault.derive(0)
                const meta: M.Wallet.Meta = {
                    name: this.name,
                    addresses: [node0.address],
                    backedUp: false
                }

                await this.$storage.wallets.insert({
                    gid: this.gid,
                    vault: vault.encode(),
                    meta: JSON.stringify(meta)
                })
            } catch (e) {
                console.warn(e)
            } finally {
                this.createFinished = true
            }
        }
    }
})
</script>
