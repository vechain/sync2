<template>
    <q-layout view="lHh Lpr lFf">
        <q-header>
            <!-- a placeholder to enable toolbar style
                body.q-ios-padding .q-layout--standard .q-header > .q-toolbar:nth-child(2)
            -->
            <div />
            <q-toolbar class="bg-white">
                <transition>
                    <q-btn
                        v-if="hasDrawer"
                        color="white"
                        text-color="black"
                        flat
                        dense
                        round
                        icon="menu"
                        aria-label="Menu"
                        @click="drawerOpen = !drawerOpen"
                    />
                    <q-btn
                        v-else
                        color="white"
                        text-color="black"
                        flat
                        dense
                        round
                        icon="keyboard_arrow_left"
                        aria-label="Keyboard Arrow Left"
                        @click="$router.back()"
                    ></q-btn>
                </transition>
                <q-toolbar-title />
            </q-toolbar>
        </q-header>

        <drawer
            :disable="!hasDrawer"
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
                        size="md"
                    >S</q-avatar>
                    <q-toolbar-title>
                        Sync
                    </q-toolbar-title>
                    <q-space />
                    <q-btn
                        icon="settings"
                        flat
                        dense
                        round
                        @click="onClickSettings"
                    ></q-btn>
                </q-toolbar>
                <!-- the grouped wallet list -->
                <q-list class="col overflow-auto">
                    <template v-for="(list, gid) in walletGroups">
                        <!-- network name -->
                        <q-item-label
                            header
                            :key="`${gid}-label`"
                            class="text-capitalize"
                        >
                            {{gid | net}}
                        </q-item-label>
                        <wallet-item
                            v-for="(wallet,i) in list"
                            :key="`${gid}-${i}`"
                            :name="wallet.meta.name"
                            @click="onSelectWallet(wallet.id)"
                            clickable
                            :active="wallet.id === $state.wallet.current.id"
                        />
                    </template>
                </q-list>
                <!-- drawer content footer -->
                <q-toolbar class="flex-center">
                    <q-btn
                        icon="add"
                        unelevated
                        size="sm"
                        color="amber"
                        @click="onNewWallet"
                    >New</q-btn>
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

export default Vue.extend({
    data() {
        return {
            drawerOpen: false
        }
    },
    computed: {
        hasDrawer() {
            return this.$route.name === 'index'
        },
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
        }
    },
    methods: {
        onClickSettings() {
            this.$router.push({ name: 'settings', query: { 'no-transition': '1' } })
            this.drawerOpen = false
        },
        onSelectWallet(id: number) {
            this.$state.wallet.setCurrentId(id)
            this.drawerOpen = false
        },
        onNewWallet() {
            alert('TODO: New Wallet')
            // TODO
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
