<template>
    <div
        v-if="wallet"
        class="fit column no-wrap"
    >
        <q-toolbar>
            <q-toolbar-title> {{wallet.meta.name}}</q-toolbar-title>
            <q-btn
                flat
                dense
                round
                icon="more_horiz"
                aria-label="More"
            >
                <q-menu>
                    <q-list>
                        <q-item>
                            <q-item-section>Accounts</q-item-section>
                        </q-item>
                        <q-item>
                            <q-item-section>Activity</q-item-section>
                        </q-item>
                        <q-item
                            v-close-popup
                            :to="{name: 'backup'}"
                        >
                            <q-item-section>Backup</q-item-section>
                        </q-item>
                        <q-item>
                            <q-item-section>Delete</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-toolbar>
        <ConnexObject
            :node="node"
            v-slot="{connex}"
        >
            <div
                id="list"
                class="row justify-center overflow-auto card-container"
            >
                <Intersecting
                    v-for="(address, i) in addresses"
                    :key="i"
                    root="list"
                    class="q-px-md q-py-sm card-wrap q-my-sm"
                    v-slot="{intersecting}"
                >
                    <AddressCard
                        class="fit shadow-4 card-shape"
                        :address="address"
                        :connex="intersecting?connex:undefined"
                        :index="i"
                        @click="onClickAddress(i)"
                    />
                </Intersecting>
                <div class="q-ma-md card-wrap row flex-center">
                    <q-btn
                        flat
                        @click="onNewAddress"
                    >New</q-btn>
                </div>
            </div>
        </ConnexObject>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'

export default Vue.extend({
    computed: {
        wallet(): M.Wallet {
            return this.$state.wallet.current!
        },
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.wallet.gid)!
        },
        addresses(): string[] {
            return this.wallet.meta.addresses
        }
    },
    methods: {
        async onNewAddress() {
            const wallet = this.wallet
            const vault = await Vault.decode(wallet.vault)
            const newAddress = (await vault.derive(wallet.meta.addresses.length)).address
            const newMeta: M.Wallet.Meta = {
                ...wallet.meta,
                addresses: [...wallet.meta.addresses, newAddress]
            }

            await this.$storage.wallets.update(
                { id: wallet.id },
                { meta: JSON.stringify(newMeta) })
        },
        onClickAddress(index: number) {
            this.$router.push({
                name: 'account',
                query: {
                    walletId: this.wallet.id.toString(),
                    addressIndex: index.toString()
                }
            })
        }
    }
})
</script>
<style>
:root {
    --card-width: min(100vw, 375px);
}
</style>
<style scoped>
.card-container {
    scroll-snap-type: y mandatory;
}
.card-wrap {
    width: var(--card-width);
    height: calc(var(--card-width) * 0.67);
    scroll-snap-align: start;
    scroll-snap-stop: always;
}
.card-shape {
    border-radius: calc(var(--card-width) * 0.07);
}
</style>
