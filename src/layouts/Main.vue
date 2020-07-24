<template>
    <q-layout
        view="lHh Lpr lFf"
        v-if="$state.config.all.passwordShadow"
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
                        @click="$router.back()"
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
            </q-header>
        </transition>

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
                <q-list
                    class="col fit overflow-auto"
                    v-scrollDivider.both
                >
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
                <!-- drawer content footer -->
                <q-toolbar>
                    <q-btn
                        icon="settings"
                        flat
                        dense
                        round
                        :to="{name: 'settings', query: {'no-transition-in': '1'}}"
                    />
                    <q-space />
                    <q-btn
                        icon="history"
                        flat
                        dense
                        round
                        :to="{name: 'activities', query: {'no-transition-in': '1'}}"
                    />
                </q-toolbar>
            </div>
        </drawer>

        <q-page-container>
            <StackedRouterView />
        </q-page-container>
    </q-layout>
    <wizard
        v-else
        class="fullscreen"
    />
</template>

<script lang="ts">
import Vue from 'vue'
import { listen } from 'core/connex/external-url'
import CreateWalletDialog from 'pages/CreateWalletDialog.vue'
import ImportWalletDialog from 'pages/ImportWalletDialog.vue'
import Wizard from 'pages/Wizard.vue'

export default Vue.extend({
    components: {
        Wizard
    },
    data() {
        return {
            drawerOpen: false
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
        }
    },
    async mounted() {
        let destroyed = false
        this.$once('hook:beforeDestroy', () => { destroyed = true })

        // loop to listen external open url
        // eslint-disable-next-line no-unmodified-loop-condition
        while (!destroyed) {
            try {
                // the incoming url looks like connex:sign?rid=xxx
                const url = new URL(await listen())
                if (url.pathname === 'sign' && !destroyed) {
                    const rid = url.searchParams.get('rid')
                    this.$router.push({
                        name: 'sign',
                        query: { rid }
                    })
                }
            } catch (err) {
                console.warn(err)
            }
        }
    }
})
</script>
