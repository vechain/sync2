<template>
    <q-layout
        view="lHh Lpr lFf"
        v-if="isSetPasswordShadow"
    >
        <transition name="q-transition--fade">
            <q-header
                class="bg-white text-black"
                :key="$route.name"
            >
                <!-- a placeholder to enable toolbar style
                body.q-ios-padding .q-layout--standard .q-header > .q-toolbar:nth-child(2)
            -->
                <div />
                <q-toolbar>
                    <!-- drawer opener, or back button -->
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
                        @click="$stack.canGoBack ? $router.back(): $router.replace({name: 'index'})"
                    ></q-btn>
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
                <q-banner
                    v-if="$state.app.updated"
                    dark
                    dense
                    inline-actions
                    class="bg-positive"
                >
                    <template v-slot:avatar>
                        <q-icon name="upgrade" />
                    </template>
                    New version is ready :)
                    <template v-slot:action>
                        <q-btn
                            @click="reloadApp"
                            size="sm"
                            flat
                            label="Upgrade Now"
                        />
                    </template>
                </q-banner>
            </q-header>
        </transition>

        <drawer
            :disable="!isIndexPage"
            v-model="drawerOpen"
            ref="drawer"
        >
            <div
                class="fit column no-wrap"
                style="width: 300px !important"
            >
                <!-- drawer content header -->
                <div class="column">
                    <q-toolbar>
                        <q-avatar
                            color="primary"
                            text-color="white"
                        >S</q-avatar>
                        <q-toolbar-title>
                            Sync
                        </q-toolbar-title>
                    </q-toolbar>
                </div>

                <q-toolbar>
                    <q-toolbar-title class="text-grey text-subtitle2">
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
                        :to="{name: 'settings', query: {'no-transition-in': '1'}}"
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
                        :to="{name: 'activities', query: {'no-transition-in': '1'}}"
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
        </drawer>

        <q-page-container v-touch-pan.right.mouse.prevent="handleDrawerPan">
            <StackedRouterView />
        </q-page-container>
    </q-layout>
    <wizard
        v-else
        @done="isSetPasswordShadow = true"
        class="fullscreen"
    />
</template>

<script lang="ts">
import Vue from 'vue'
import CreateWalletDialog from 'pages/CreateWalletDialog.vue'
import ImportWalletDialog from 'pages/ImportWalletDialog.vue'
import Wizard from 'pages/Wizard'

export default Vue.extend({
    components: {
        Wizard
    },
    data() {
        return {
            drawerOpen: false,
            isSetPasswordShadow: !!this.$state.config.all.passwordShadow
        }
    },
    computed: {
        isIndexPage() { return this.$route.name === 'index' },
        title(): string {
            if (this.$route.name === 'index') {
                const wallet = this.$state.wallet.current
                return wallet ? wallet.meta.name : ''
            }
            return this.$route.meta.title
        },
        version() {
            return `v${process.env.APP_VERSION} (${process.env.APP_BUILD})`
        }
    },
    watch: {
        $route() {
            this.drawerOpen = false
        }
    },
    methods: {
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
        },
        handleDrawerPan(ev: Record<string, unknown>) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.$refs.drawer as any).handleTouchPanExternal(ev)
        },
        reloadApp() {
            window.location.reload(true)
        }
    }
})
</script>
