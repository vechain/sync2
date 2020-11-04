<template>
    <ConnexObject
        v-if="wallet"
        :node="node"
        v-slot="{connex}"
    >
        <!-- address cart list -->
        <div class="column fit">
            <q-banner
                v-if="wallet.meta.backedUp"
                inline-actions
                rounded
                class="text-white bg-orange q-mx-sm self-center q-my-sm"
            >
                Backup allows you to regain wallet access if you lose this device.
                <template v-slot:action>
                    <q-btn
                        flat
                        :to="{name: 'backup'}"
                        color="white"
                        label="BACK UP"
                    />
                </template>
            </q-banner>
            <div class="col relative-position">
                <q-badge
                    v-show="networkBadgeText"
                    color="orange"
                    floating
                    transparent
                    class="z-top q-mt-md text-subtitle2 text-capitalize q-mr-lg"
                >{{networkBadgeText}}</q-badge>
                <div
                    id="list"
                    ref="list"
                    v-scrollDivider
                    class="fit row justify-center overflow-auto content-start card-container"
                >
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
            </div>
        </div>
    </ConnexObject>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'
import { scroll } from 'quasar'

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
        },
        networkBadgeText(): string {
            const net = this.$options.filters!.net(this.wallet.gid)
            if (net === 'main') {
                return ''
            }
            return (net || 'private') + ' net'
        }
    },
    watch: {
        'wallet.id'() {
            const list = this.$refs.list as HTMLElement
            list && list.scrollTo({ top: 0, behavior: 'auto' })
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
                scroll.setScrollPosition(list, list.scrollHeight, 500)
            })
        },
        onClickCard(index: number) {
            this.$router.push({
                name: 'account',
                query: {
                    wId: this.wallet.id.toString(),
                    i: index.toString()
                }
            })
        },
        onDelete() {
            this.$q.dialog({
                title: 'Delete Wallet',
                message: 'Are you sure? this cannot be undone. Unless you have backed up your wallet beforehand',
                ok: {
                    label: 'Delete',
                    flat: true
                },
                cancel: {
                    label: 'Cancel'
                }
            }).onOk(async () => {
                await this.$authenticate(() => {
                    return Promise.resolve()
                })
                this.$storage.wallets.delete({ id: this.wallet.id })
            })
        },
        onRename() {
            this.$q.dialog({
                title: 'Rename',
                message: 'Wallet name helps you quickly identify the wallet.',
                prompt: {
                    model: '',
                    isValid: (val: string) => { return !!val && !!val.trim() },
                    type: 'text'
                },
                cancel: true,
                ok: true
            }).onOk((data: string) => {
                this.wallet.meta.name = data
                this.$storage.wallets.update({ id: this.wallet.id }, {
                    meta: JSON.stringify(this.wallet.meta)
                }).then(() => {
                    this.$q.notify('Wallet updated')
                })
            })
        },
        onOpenMore() {
            const addressFull = this.addresses.length >= MAX_ADDRESS
            this.$actionSheets([
                {
                    label: 'New Account',
                    onClick: addressFull ? undefined : () => this.onClickNewAccount(),
                    classes: addressFull ? 'text-grey' : ''
                },
                {
                    label: 'Backup',
                    onClick: () => this.$router.push({ name: 'backup' })
                },
                {
                    label: 'Rename',
                    onClick: () => {
                        this.onRename()
                    }
                },
                { label: '-' }, // separator
                {
                    label: 'Delete',
                    classes: 'text-negative',
                    onClick: () => { this.onDelete() }
                }
            ])
        }
    },
    created() {
        const event = `more-${this.$route.fullPath}`
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
body.q-ios-padding .card-container {
    padding-bottom: env(safe-area-inset-bottom) !important;
}
.card-wrap {
    width: var(--card-width);
    height: calc(var(--card-width) * 0.67);
    scroll-snap-align: start;
}
.card-shape {
    border-radius: calc(var(--card-width) * 0.07);
}
</style>
