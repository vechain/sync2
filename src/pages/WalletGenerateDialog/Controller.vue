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
                >Cancel</q-btn>
                <q-toolbar-title class="absolute-center text-capitalize">
                    {{title}}
                </q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-form
                    class="q-px-md"
                    @submit="onSubmit"
                >
                    <q-input
                        v-model.trim="name"
                        autofocus
                        no-error-icon
                        :rules="[val => val.length > 0 || 'Give it a name!']"
                        label="Wallet Name"
                    />
                    <q-input
                        type="textarea"
                        v-if="type === 'import'"
                        no-error-icon
                        v-model.trim="words"
                        label="Mnemonic Words"
                        hint="Enter the mnemonic words and seperated by single space"
                        :rules="[
                            val => val && val.length > 0 || 'Please enter mnemonic words',
                            val => checkMnemonic(val) || 'Invalid mnemonic words'
                        ]"
                    />

                    <q-slide-transition>
                        <div
                            v-if="!expanded"
                            class="justify-end row"
                        >
                            <q-btn
                                label="Advance"
                                size="sm"
                                color="blue-9"
                                flat
                                @click="expanded = true"
                            />
                        </div>
                        <Network
                            v-if="expanded"
                            v-model="gid"
                            :nodes="nodes"
                        />
                    </q-slide-transition>
                    <div class="justify-center row q-pt-xl">
                        <q-btn
                            unelevated
                            class="col-6"
                            color="blue-9"
                            type="submit"
                        > <span class="text-capitalize">{{type}}</span> </q-btn>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import Network from './Network.vue'
import { Vault } from '../../core/vault'
import { gids } from '../../consts'
import { mnemonic } from 'thor-devkit'

export default Vue.extend({
    components: {
        Network
    },
    props: {
        type: {
            type: String as () => 'import' | 'create',
            default: () => 'create'
        }
    },
    computed: {
        nodes(): M.Node[] {
            return this.$state.config.node.list
        },
        title(): string {
            return `${this.type} wallet`
        },
        message(): string {
            return this.type === 'import' ? 'Wallet successfully imported' : 'Wallet successfully created'
        }
    },
    data() {
        return {
            expanded: false,
            gid: gids.main,
            name: '',
            words: ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        checkMnemonic(words: string) {
            return mnemonic.validate(words.split(' '))
        },
        async generateWallet(words: string[], pin: string) {
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
        },
        async onSubmit() {
            let pin = ''
            try {
                pin = await this.$authenticate(pin => Promise.resolve(pin))
            } catch (e) {
                return
            }
            this.$loading(async () => {
                try {
                    const words =
                        this.type === 'import'
                            ? this.words.split(' ')
                            : await Vault.generateMnemonic(16)

                    await this.generateWallet(words, pin)
                    this.$q.notify({
                        type: 'positive',
                        message: this.message,
                        timeout: 1500
                    })
                    this.hide()
                } catch (error) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Something wrong!',
                        timeout: 1500
                    })
                }
            })
        }
    }
})
</script>
