<template>
    <q-layout view="lHh Lpr lFf">
        <q-header>
            <!-- a placeholder to enable toolbar style
                body.q-ios-padding .q-layout--standard .q-header > .q-toolbar:nth-child(2)
            -->
            <div />
            <q-toolbar class="bg-white text-black">
                <transition>
                    <q-btn
                        v-if="isIndexPage"
                        flat
                        dense
                        round
                        icon="menu"
                        aria-label="Menu"
                        @click="drawerOpen = !drawerOpen"
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
                <q-toolbar-title class="text-center text-black">{{title}}</q-toolbar-title>
                <!-- action history button -->
                <q-btn
                    dense
                    round
                    flat
                    icon="history"
                    :class="{invisible: !isIndexPage}"
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
                        size="md"
                    >S</q-avatar>
                    <q-toolbar-title>
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
        title(): string { return this.$route.meta.title }
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
