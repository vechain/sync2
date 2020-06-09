<template>
    <q-layout container>
        <q-header class="bg-white text-black">
            <q-item>
                <q-item-section>
                    <span class="text-subtitle1">Sync Pro</span>
                </q-item-section>
                <q-item-section side>
                    <q-btn
                        color="white"
                        text-color="grey-6"
                        size="13px"
                        flat
                        dense
                        round
                        :to="{name: 'settings'}"
                        icon="settings"
                        aria-label="Settings"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <span class="text-h6">Mainnet</span>
                </q-item-section>
                <q-item-section side>
                    <router-link
                        class="text-caption"
                        to="/"
                    >Switch</router-link>
                </q-item-section>
            </q-item>
        </q-header>
        <q-footer
            height-hint="58"
            class="bg-white q-py-md text-center"
        >
            <q-btn
                icon="add"
                unelevated
                size="sm"
                color="amber"
                @click="onAdd"
            >Add</q-btn>
        </q-footer>
        <q-page-container>
            <q-page>
                <q-list>
                    <template v-for="(item, index) in wallets">
                        <q-separator
                            v-if="index !==0 "
                            :key="item.id + 's'"
                            spaced
                        />
                        <q-item
                            clickable
                            v-ripple
                            :key="item.id + 'p'"
                            @click="onClick(item.id)"
                        >
                            <q-item-section
                                avatar
                                top
                            >
                                <q-avatar
                                    color="primary"
                                    text-color="black"
                                />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label lines="1">{{item.meta.name}}</q-item-label>
                                <q-item-label caption>February 22nd, 2019</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'
export default Vue.extend({
    computed: {
        wallets() {
            return this.$state.wallet.list
        },
        current() {
            return this.$state.wallet.current
        }
    },
    methods: {
        onClick(id: number) {
            this.$state.wallet.setCurrentId(id)
            this.$emit('wallet-change', id)
        },
        async onAdd() {
            const password = await this.$authenticate(password =>
                Vault.verifyPassword(this.$state.config.all.passwordShadow, password)
                    .then(() => password)
            ).catch(e => {
                console.log(e)
            })

            if (!password) { return }
            try {
                const words = await Vault.generateMnemonic()
                const vault = await Vault.createHD(words, password)
                const node0 = await vault.derive(0)
                const meta: M.Wallet.Meta = {
                    name: 'my wallet',
                    addresses: [{ address: node0.address, visible: true }]
                }
                await this.$storage.wallets.insert({
                    gid: this.$state.config.node.list[0].gid,
                    vault: vault.encode(),
                    meta: JSON.stringify(meta)
                })
            } catch (error) {
                console.warn(error)
                alert('something wrong')
            }
        }
    }
})
</script>
