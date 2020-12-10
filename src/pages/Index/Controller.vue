<template>
    <div
        class="column fit"
        v-touch-pan.right.mouse.prevent="handleDrawerTouchPan"
    >
        <PageToolbar
            :title="wallet && wallet.meta.name"
            icon="menu"
            :gid="wallet && wallet.gid"
            @action="drawerOpen=true"
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
            v-if="wallet"
            :wallet="wallet"
            class="self-center"
        />
        <address-card-list
            v-if="wallet"
            ref="list"
            :wallet="wallet"
            class="container col"
        />
        <drawer
            v-model="drawerOpen"
            ref="drawer"
        >
            <drawer-panel>
                <wallet-list
                    :wallets="wallets"
                    v-model="selectedWalletId"
                />
            </drawer-panel>
        </drawer>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import BackupTip from './BackupTip.vue'
import UpgradeTip from './UpgradeTip.vue'
import DrawerPanel from './DrawerPanel.vue'
import WalletList from './WalletList.vue'
import AddressCardList from './AddressCardList.vue'
import { Vault } from 'core/vault'
import { scroll } from 'quasar'

const MAX_ADDRESS = 10

export default Vue.extend({
    components: { BackupTip, UpgradeTip, DrawerPanel, WalletList, AddressCardList },
    data: () => {
        return {
            drawerOpen: false,
            selectedWalletId: 0
        }
    },
    computed: {
        wallet(): M.Wallet | null {
            return this.wallets.find(w => w.id === this.selectedWalletId) || null
        }
    },
    asyncComputed: {
        wallets: {
            get() { return this.$svc.wallet.all() },
            default: []
        }
    },
    watch: {
        selectedWalletId() {
            this.drawerOpen = false
            const list = this.$refs.list as Vue
            list && list.$el.scrollTo({ top: 0, behavior: 'auto' })
        }
    },
    methods: {
        onClickMenuBtn() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            const addressFull = wallet.meta.addresses.length >= MAX_ADDRESS
            this.$actionSheets([
                {
                    label: this.$t('index.action_new_account').toString(),
                    onClick: addressFull ? undefined : () => this.newAccount(),
                    classes: addressFull ? 'text-grey' : ''
                },
                {
                    label: this.$t('index.action_backup').toString(),
                    onClick: () => this.$router.push({ name: 'backup' })
                },
                {
                    label: this.$t('index.action_rename').toString(),
                    onClick: () => this.rename()
                },
                { label: '-' }, // separator
                {
                    label: this.$t('common.delete').toString(),
                    classes: 'text-negative',
                    onClick: () => this.delete()
                }
            ])
        },
        newAccount() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            this.$loading(async () => {
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
                const list = this.$refs.list as Vue
                list && scroll.setScrollPosition(list.$el, list.$el.scrollHeight, 500)
            })
        },
        rename() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            this.$q.dialog({
                parent: this,
                title: this.$t('index.action_rename').toString(),
                message: this.$t('index.msg_rename').toString(),
                prompt: {
                    model: '',
                    isValid: (val: string) => { return !!val && !!val.trim() },
                    type: 'text'
                },
                cancel: true,
                ok: {
                    label: this.$t('common.confirm').toString()
                }
            }).onOk((data: string) => {
                wallet.meta.name = data
                this.$storage.wallets.update({ id: wallet.id }, {
                    meta: JSON.stringify(wallet.meta)
                }).then(() => {
                    this.$q.notify(this.$t('common.wallet_updated'))
                })
            })
        },
        delete() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            this.$q.dialog({
                parent: this,
                title: this.$t('common.delete').toString(),
                message: this.$t('index.msg_delete').toString(),
                ok: {
                    label: this.$t('common.yes').toString(),
                    color: 'negative'
                },
                cancel: {
                    label: this.$t('common.no').toString(),
                    flat: true
                }
            }).onOk(async () => {
                await this.$authenticate(() => {
                    return Promise.resolve()
                })
                this.$storage.wallets.delete({ id: wallet.id })
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
</style>
