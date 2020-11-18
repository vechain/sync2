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
                    <div
                        v-if="!advance"
                        class="justify-end row"
                    >
                        <q-btn
                            label="Advance"
                            size="sm"
                            color="blue-9"
                            flat
                            @click="advance = true"
                        />
                    </div>
                    <template v-else>
                        <div class="q-mt-lg">Network</div>
                        <q-radio
                            v-for="item in nodes"
                            :key="item.gid"
                            v-model="gid"
                            class="text-capitalize"
                            :val="item.gid"
                            :label="item.gid | net"
                        />
                    </template>
                    <div class="justify-center row q-pt-xl">
                        <q-btn
                            unelevated
                            :disable="creating"
                            class="text-capitalize col-6"
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
            creating: false,
            advance: false
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
            let pin = ''
            try {
                pin = await this.$authenticate(pin => Promise.resolve(pin))
            } catch (e) {
                return
            }
            this.$loading(async () => {
                this.creating = true
                try {
                    const words = await Vault.generateMnemonic(16)
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
                    this.$q.notify({
                        type: 'positive',
                        message: 'Wallet successfully created ',
                        timeout: 1500
                    })
                    this.hide()
                } catch (error) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Something wrong!',
                        timeout: 1500
                    })
                } finally {
                    this.creating = false
                }
            })
        }
    }
})
</script>
