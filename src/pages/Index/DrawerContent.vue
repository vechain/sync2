<template>
    <div
        class="fit column no-wrap"
        style="width: 300px !important"
    >
        <!-- drawer content header -->
        <div class="column">
            <q-toolbar>
                <q-avatar
                    rounded
                    color="primary"
                    text-color="white"
                >
                    <img src="~assets/logoSync.svg">
                </q-avatar>
                <q-toolbar-title>
                    Sync2
                </q-toolbar-title>
            </q-toolbar>
        </div>

        <q-toolbar>
            <q-toolbar-title class="text-h6">
                Wallets
            </q-toolbar-title>
            <q-btn
                flat
                round
                dense
                icon="add"
                @click="onClickAddWallet"
            />
        </q-toolbar>

        <!-- the grouped wallet list -->
        <div
            class="col overflow-auto"
            v-scrollDivider.both
        >
            <q-list>
                <wallet-item
                    v-for="wallet in $state.wallet.list"
                    :key="wallet.id"
                    :name="wallet.meta.name"
                    @click="onClickWallet(wallet.id)"
                    clickable
                    :active="wallet.id === $state.wallet.current.id"
                    :net="wallet.gid | net"
                    active-class="bg-blue-1"
                />
            </q-list>
        </div>
        <!-- drawer content footer -->
        <div class="no-wrap q-mt-auto q-pb-md items-start q-gutter-y-sm">
            <q-item
                class="full-width"
                dense
                :to="{name: 'settings'}"
            >
                <q-item-section
                    avatar
                    side
                >
                    <q-icon
                        size="sm"
                        name="settings"
                    />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
            </q-item>
            <q-item
                dense
                :to="{name: 'activities'}"
            >
                <q-item-section
                    avatar
                    side
                >
                    <q-icon
                        size="sm"
                        name="history"
                    />
                </q-item-section>
                <q-item-section>Activities</q-item-section>
            </q-item>
            <TxActivityUpdate />
        </div>
        <span class="full-width text-center text-grey text-caption">{{version}}</span>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import CreateWalletDialog from 'pages/CreateWalletDialog.vue'
import ImportWalletDialog from 'pages/ImportWalletDialog.vue'

export default Vue.extend({
    computed: {
        version() {
            return `v${process.env.APP_VERSION} (${process.env.APP_BUILD})`
        }
    },
    methods: {
        onClickAddWallet() {
            this.$actionSheets([
                { label: 'Create Wallet', onClick: () => { this.onClickCreateWallet() } },
                { label: 'Import Wallet', onClick: () => { this.onClickImportWallet() } }
            ])
        },
        onClickWallet(id: number) {
            this.$state.wallet.setCurrentId(id)
        },
        onClickCreateWallet() {
            this.$q.dialog({
                component: CreateWalletDialog,
                parent: this
            })
        },
        onClickImportWallet() {
            this.$q.dialog({
                component: ImportWalletDialog,
                parent: this
            })
        }
    }
})
</script>
