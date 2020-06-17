<template>
    <div
        v-if="wallet"
        class="fit column no-wrap"
    >
        <q-toolbar>
            <q-toolbar-title> {{wallet.meta.name}}</q-toolbar-title>
            <!-- menu -->
            <q-btn
                flat
                dense
                round
                icon="more_horiz"
                aria-label="More"
            >
                <q-menu auto-close>
                    <!-- limit to 10 accounts -->
                    <q-item
                        v-if="addresses.length<10"
                        clickable
                        @click="onClickNewAccount"
                    >
                        <q-item-section no-wrap>New Account</q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section no-wrap>Activity</q-item-section>
                    </q-item>
                    <q-item :to="{name: 'backup'}">
                        <q-item-section no-wrap>Backup</q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section no-wrap>Delete</q-item-section>
                    </q-item>
                </q-menu>
            </q-btn>
        </q-toolbar>
        <ConnexObject
            :node="node"
            v-slot="{connex}"
        >
            <!-- address cart list -->
            <div
                id="list"
                ref="list"
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
        onClickNewAccount() {
            this.$loading(async () => {
                const wallet = this.wallet
                const addresses = wallet.meta.addresses

                // limit to 10 accounts
                if (addresses.length >= 10) {
                    return
                }
                const vault = await Vault.decode(wallet.vault)
                const newAddress = (await vault.derive(addresses.length)).address
                const newMeta: M.Wallet.Meta = {
                    ...wallet.meta,
                    addresses: [...addresses, newAddress]
                }

                await this.$storage.wallets.update(
                    { id: wallet.id },
                    { meta: JSON.stringify(newMeta) })

                await new Promise(resolve => setTimeout(resolve, 300))
                const list = this.$refs.list as HTMLElement
                list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
            })
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
    padding-bottom: calc(var(--card-width) * 0.67);
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
