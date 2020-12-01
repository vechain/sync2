<template>
    <ConnexObject
        v-if="wallet"
        :node="node"
        v-slot="{connex}"
        tag="div"
        class="column fit"
        v-touch-pan.right.mouse.prevent="handleDrawerTouchPan"
    >
        <PageToolbar
            :title="wallet.meta.name"
            :nav="nav"
            :gid="wallet.gid"
        >
            <q-btn
                class="q-ml-auto"
                flat
                dense
                round
                icon="more_horiz"
                @click="onClickMenuBtn"
            />
        </PageToolbar>
        <upgrade-tip v-if="$state.app.updated" />
        <backup-tip
            v-if="!wallet.meta.backedUp"
            class="self-center"
        />
        <div
            class="container col row overflow-auto justify-center content-start"
            ref="list"
            v-scrollDivider
        >
            <Intersecting
                :cfg="{threshold: 0.2}"
                v-for="(address,i) in addresses"
                class="address-card-wrap q-pa-md"
                :key="address"
                v-slot="{entry}"
            >
                <ConnexContinuous
                    :connex="entry.isIntersecting ? connex: null"
                    :query="()=> connex.thor.account(address).get()"
                    v-slot="{data}"
                >
                    <AddressCard
                        class="address-card fit"
                        :index="i"
                        :address="address"
                        :account="data"
                        @click="onClickCard(i)"
                    />
                </ConnexContinuous>
            </Intersecting>
        </div>
        <drawer
            v-model="drawerOpen"
            ref="drawer"
        >
            <DrawerContent />
        </drawer>
    </ConnexObject>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressCard from './AddressCard.vue'
import BackupTip from './BackupTip.vue'
import DrawerContent from './DrawerContent.vue'
import UpgradeTip from './UpgradeTip.vue'
import { Vault } from 'core/vault'
import { scroll } from 'quasar'

const MAX_ADDRESS = 10

export default Vue.extend({
    components: { AddressCard, BackupTip, DrawerContent, UpgradeTip },
    data: () => {
        return {
            drawerOpen: false
        }
    },
    computed: {
        wallet(): M.Wallet {
            return this.$state.wallet.current!
        },
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.genesis.id === this.wallet.gid)!
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
        },
        nav() {
            return {
                icon: 'menu',
                action: () => {
                    this.drawerOpen = true
                }
            }
        }
    },
    watch: {
        'wallet.id'() {
            this.drawerOpen = false
            const list = this.$refs.list as HTMLElement
            list && list.scrollTo({ top: 0, behavior: 'auto' })
        }
    },
    methods: {
        onClickCard(index: number) {
            this.$router.push({
                name: 'account',
                query: {
                    wId: this.wallet.id.toString(),
                    i: index.toString()
                }
            })
        },
        onClickMenuBtn() {
            const addressFull = this.addresses.length >= MAX_ADDRESS
            this.$actionSheets([
                {
                    label: 'New Account',
                    onClick: addressFull ? undefined : () => this.newAccount(),
                    classes: addressFull ? 'text-grey' : ''
                },
                {
                    label: 'Backup',
                    onClick: () => this.$router.push({ name: 'backup' })
                },
                {
                    label: 'Rename',
                    onClick: () => this.rename()
                },
                { label: '-' }, // separator
                {
                    label: 'Delete',
                    classes: 'text-negative',
                    onClick: () => this.delete()
                }
            ])
        },
        newAccount() {
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
        rename() {
            this.$q.dialog({
                title: 'Rename',
                message: 'Wallet name helps you quickly identify the wallet.',
                prompt: {
                    model: '',
                    isValid: (val: string) => { return !!val && !!val.trim() },
                    type: 'text'
                },
                cancel: true,
                ok: {
                    label: 'Save'
                }
            }).onOk((data: string) => {
                this.wallet.meta.name = data
                this.$storage.wallets.update({ id: this.wallet.id }, {
                    meta: JSON.stringify(this.wallet.meta)
                }).then(() => {
                    this.$q.notify('Wallet updated')
                })
            })
        },
        delete() {
            this.$q.dialog({
                title: 'Delete Wallet',
                message: 'Are you sure? this cannot be undone. Unless you have backed up your wallet beforehand',
                ok: {
                    label: 'Delete',
                    color: 'negative'
                },
                cancel: {
                    label: 'Cancel',
                    flat: true
                }
            }).onOk(async () => {
                await this.$authenticate(() => {
                    return Promise.resolve()
                })
                this.$storage.wallets.delete({ id: this.wallet.id })
            })
        },
        handleDrawerTouchPan(ev: Record<string, unknown>) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.$refs.drawer as any).handleTouchPanExternal(ev)
        }
    }
})
</script>
<style scoped>
.container {
    /* scroll-snap-type: y mandatory; */
}
body.q-ios-padding .container {
    padding-bottom: env(safe-area-inset-bottom) !important;
}
.address-card-wrap {
    width: min(100vw, 375px);
    height: calc(min(100vw, 375px) * 0.67);
}
.address-card {
    border-radius: calc(min(100vw, 375px) * 0.05);
}
</style>
