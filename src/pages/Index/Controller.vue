<template>
    <div
        class="column fit"
        v-touch-pan.right.mouse.prevent="handleDrawerTouchPan"
    >
        <PageToolbar
            :title="title"
            icon="menu"
            :gid="wallet && wallet.gid"
            @action="drawerOpen=true"
        >
            <q-btn
                v-if="wallet"
                class="q-ml-auto"
                flat
                dense
                round
                icon="more_horiz"
            >
                <Menu :wallet="wallet" />
            </q-btn>
        </PageToolbar>
        <!-- tips -->
        <div class="narrow-page q-pa-sm q-mx-auto q-gutter-y-sm">
            <upgrade-tip v-if="$state.app.updateAvailable" />
            <backup-tip
                v-for="w in wallets"
                :key="w.id"
                v-show="w.id === selectedWalletId && !w.meta.backedUp"
            />
        </div>
        <!-- address list -->
        <address-card-list
            v-if="wallet"
            ref="list"
            :wallet="wallet"
            class="container col"
        />
        <div
            v-if="wallets.length === 0 && !$asyncComputed.wallets.updating"
            class="narrow-page q-my-auto text-center self-center"
        >
            <p class="text-grey text-h5 text-center col-12">No Wallet</p>
            <q-btn
                unelevated
                color="primary"
                class="w40"
                :label="$t('index.action_create')"
                :to="{name: 'new-wallet'}"
            />
        </div>
        <!-- the drawer -->
        <drawer
            v-model="drawerOpen"
            ref="drawer"
        >
            <drawer-panel>
                <wallet-list
                    :wallets="wallets"
                    @select="drawerOpen=false"
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
import Menu from './Menu.vue'
import { scroll } from 'quasar'

export default Vue.extend({
    components: { BackupTip, UpgradeTip, DrawerPanel, WalletList, AddressCardList, Menu },
    data: () => {
        return {
            drawerOpen: false
        }
    },
    computed: {
        wallet(): M.Wallet | null {
            return this.wallets ? this.wallets.find(w => w.id === this.selectedWalletId) || this.wallets[0] || null
                : null
        },
        title(): string {
            return (this.wallet && this.wallet.meta.name) || 'Sync'
        }
    },
    asyncComputed: {
        wallets: {
            get() { return this.$svc.wallet.all() },
            default: []
        },
        selectedWalletId() {
            return this.$svc.config.getSelectedWalletId()
        }
    },
    watch: {
        selectedWalletId() {
            const list = this.$refs.list as Vue
            list && list.$el.scrollTo({ top: 0, behavior: 'auto' })
        },
        wallet(newVal: M.Wallet | null, oldVal: M.Wallet | null) {
            if (newVal && oldVal) {
                // new address added
                if (newVal.id === oldVal.id &&
                    newVal.meta.addresses.length !== oldVal.meta.addresses.length) {
                    const list = this.$refs.list as Vue
                    list && scroll.setScrollPosition(list.$el, list.$el.scrollHeight, 500)
                }
            }
        }
    },
    methods: {
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
