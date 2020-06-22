<template>
    <q-layout view="lHh Lpr lFf">
        <q-header>
            <!-- a placeholder to enable toolbar style
                body.q-ios-padding .q-layout--standard .q-header > .q-toolbar:nth-child(2)
            -->
            <div />
            <q-toolbar class="bg-white text-black">
                <!-- drawer opener, or back button -->
                <transition>
                    <q-btn
                        v-if="isIndexPage"
                        flat
                        dense
                        round
                        icon="menu"
                        aria-label="Menu"
                        @click="drawerOpen = true"
                    />
                    <q-btn
                        v-else
                        flat
                        dense
                        round
                        icon="keyboard_arrow_left"
                        aria-label="Keyboard Arrow Left"
                        @click="$router.back()"
                    ></q-btn>
                </transition>
                <!-- title -->
                <q-toolbar-title class="text-center">{{title}}</q-toolbar-title>
                <!-- more button (overflow menu button) -->
                <q-btn
                    :class="{invisible: !$route.meta.hasMenu}"
                    flat
                    dense
                    round
                    icon="more_horiz"
                    @click="onClickMore"
                />
            </q-toolbar>
        </q-header>

        <drawer
            :disable="!isIndexPage"
            v-model="drawerOpen"
        >
            <div
                class="column full-height"
                style="width:300px"
            >
                <!-- drawer content header -->
                <q-toolbar>
                    <q-avatar
                        color="primary"
                        text-color="white"
                    >S</q-avatar>
                    <q-toolbar-title>
                        Sync
                    </q-toolbar-title>
                </q-toolbar>
                <q-toolbar>
                    <q-toolbar-title>
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
                <div class="col relative-position">
                    <q-list class="fit overflow-auto">
                        <scroll-divider />
                        <scroll-divider bottom />
                        <template v-for="(list, gid) in walletGroups">
                            <!-- network name -->
                            <q-item-label
                                header
                                :key="`${gid}-label`"
                                class="text-capitalize text-caption"
                            >
                                {{gid | net}}
                            </q-item-label>
                            <wallet-item
                                v-for="(wallet,i) in list"
                                :key="`${gid}-${i}`"
                                :name="wallet.meta.name"
                                @click="onClickWallet(wallet.id)"
                                clickable
                                :active="wallet.id === $state.wallet.current.id"
                            />
                        </template>
                    </q-list>
                </div>
                <!-- drawer content footer -->
                <q-toolbar>
                    <q-btn
                        icon="settings"
                        flat
                        dense
                        round
                        @click="onClickSettings"
                    />
                    <q-space />
                    <q-btn
                        icon="history"
                        flat
                        dense
                        round
                    />
                </q-toolbar>
            </div>
        </drawer>

        <q-page-container>
            <StackedRouterView />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import FirstRunDialog from 'pages/FirstRunDialog.vue'
import CreateWalletDialog from 'pages/CreateWalletDialog.vue'
import ImportWalletDialog from 'pages/ImportWalletDialog.vue'

export default Vue.extend({
    data() {
        return {
            drawerOpen: false
        }
    },
    computed: {
        isIndexPage() { return this.$route.name === 'index' },
        walletGroups() {
            return this.$state.wallet.list.reduce<Record<string, M.Wallet[]>>((groups, w) => {
                const g = groups[w.gid]
                if (g) {
                    g.push(w)
                } else {
                    groups[w.gid] = [w]
                }
                return groups
            }, {})
        },
        title(): string {
            if (this.$route.name === 'index') {
                const wallet = this.$state.wallet.current
                return wallet ? wallet.meta.name : ''
            }
            return this.$route.meta.title
        }
    },
    watch: {
        $route() {
            this.drawerOpen = false
        }
    },
    methods: {
        onClickSettings() {
            this.$router.push({ name: 'settings', query: { 'no-transition': '1' } })
        },
        onClickWallet(id: number) {
            this.$state.wallet.setCurrentId(id)
            this.drawerOpen = false
        },
        onClickAddWallet() {
            this.$actionSheets([
                { label: 'Create Wallet', onClick: () => { this.onClickCreateWallet() } },
                { label: 'Import Wallet', onClick: () => { this.onClickImportWallet() } }
            ])
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
        },
        onClickMore() {
            this.$root.$emit(`more-${this.$route.fullPath}`)
        }
    },
    created() {
        if (!this.$state.config.all.passwordShadow) {
            this.$q.dialog({
                component: FirstRunDialog,
                parent: this
            })
        }
    }
})
</script>
