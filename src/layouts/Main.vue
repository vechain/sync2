<template>
    <q-layout view="lHh Lpr lFf">
        <q-header class>
            <!-- a placeholder to enable toolbar style
                body.q-ios-padding .q-layout--standard .q-header > .q-toolbar:nth-child(2)
            -->
            <div />
            <q-toolbar class="bg-white">
                <q-btn
                    color="white"
                    text-color="black"
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                    @click="leftDrawerOpen = !leftDrawerOpen"
                />
                <q-toolbar-title />
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            show-if-above
            bordered
            content-class="bg-grey-1"
        >
            <q-item>
                <q-item-section>
                    <span class="text-subtitle1">Sync Pro</span>
                </q-item-section>
                <q-item-section side>
                    <q-btn
                        color="white"
                        text-color="grey-6"
                        size="13px"
                        flat
                        dense
                        round
                        icon="settings"
                        aria-label="Settings"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <span class="text-h6">Mainnet</span>
                </q-item-section>
                <q-item-section side>
                    <router-link
                        class="text-caption"
                        to="/"
                    >Switch</router-link>
                </q-item-section>
            </q-item>
            <q-list>
                <q-item
                    clickable
                    v-ripple
                    v-for="i in 5"
                    :key="i"
                    :to="{
                        name: 'wallet',
                        params: {
                            id: i
                        }
                    }"
                >
                    <q-item-section
                        avatar
                        top
                    >
                        <q-avatar
                            color="primary"
                            text-color="black"
                        />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label lines="1">Wallet {{i}}</q-item-label>
                        <q-item-label caption>February 22nd, 2019</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            leftDrawerOpen: false
        }
    }
})
</script>
