<template>
    <q-layout container>
        <q-header class="bg-white text-black">
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
        </q-header>
        <q-footer
            height-hint="58"
            class="bg-white q-py-md text-center"
        >
            <q-btn
                icon="add"
                unelevated
                size="sm"
                color="amber"
            >Add</q-btn>
        </q-footer>
        <q-page-container>
            <q-page>
                <q-list>
                    <template v-for="(item, index) in wallets">
                        <q-separator
                            v-if="index !==0 "
                            :key="item.id + 's'"
                            spaced
                        />
                        <q-item
                            clickable
                            v-ripple
                            :key="item.id + 'p'"
                            @click="onClick(item.id)"
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
                                <q-item-label lines="1">{{item.meta.name}}</q-item-label>
                                <q-item-label caption>February 22nd, 2019</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    computed: {
        wallets() {
            return this.$state.wallet.list
        },
        current() {
            return this.$state.wallet.current
        }
    },
    methods: {
        onClick(id: number) {
            this.$state.wallet.setCurrentId(id)
            this.$emit('wallet-change', id)
        }
    }
})
</script>
