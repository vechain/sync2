<template>
    <ConnexObject
        v-if="wallet"
        :node="node"
        v-slot="{connex}"
    >
        <!-- address cart list -->
        <div
            id="list"
            ref="list"
            class="fit row justify-center content-start overflow-auto card-container"
        >
            <scroll-divider />
            <Intersecting
                v-for="(address, i) in addresses"
                :key="i"
                root="list"
                class="card-wrap q-px-md q-py-md"
                v-slot="{intersecting}"
            >
                <AddressCard
                    class="fit card-shape"
                    flat
                    :address="address"
                    :connex="intersecting?connex:undefined"
                    :index="i"
                    @click="onClickCard(i)"
                />
            </Intersecting>
        </div>
    </ConnexObject>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'

const MAX_ADDRESS = 10

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
    watch: {
        'wallet.id'() {
            const list = this.$refs.list as HTMLElement
            list.scrollTo({ top: 0, behavior: 'auto' })
        }
    },
    methods: {
        onClickNewAccount() {
            this.$loading(async () => {
                const wallet = this.wallet
                const addresses = wallet.meta.addresses

                if (addresses.length >= MAX_ADDRESS) {
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
        onClickCard(index: number) {
            this.$router.push({
                name: 'account',
                query: {
                    walletId: this.wallet.id.toString(),
                    addressIndex: index.toString()
                }
            })
        },
        onOpenMore() {
            const addressFull = this.addresses.length >= MAX_ADDRESS
            this.$actionSheets([
                { label: 'New Account', onClick: addressFull ? undefined : () => this.onClickNewAccount(), classes: addressFull ? 'text-grey' : '' },
                { label: 'Backup', onClick: () => this.$router.push({ name: 'backup' }) },
                { label: '-' }, // separator
                { label: 'Delete', classes: 'text-negative', onClick: () => { alert('TODO: oops') } }
            ])
        }
    },
    created() {
        const event = `more-${this.$attrs['stacked-full-path']}`
        const cb = () => this.onOpenMore()
        this.$root.$on(event, cb)
        this.$once('hook:beforeDestroy', () => this.$root.$off(event, cb))
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
