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
                        v-if="showMenuBtn"
                        color="white"
                        text-color="black"
                        flat
                        dense
                        round
                        icon="menu"
                        aria-label="Menu"
                        @click="leftDrawerOpen = !leftDrawerOpen"
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

        <drawer v-model="leftDrawerOpen">
            <MainDrawerContent
                @wallet-change="onWalletChange"
                style="width:300px"
            />
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
            leftDrawerOpen: false
        }
    },
    watch: {
        '$route'(to, from) {
            this.leftDrawerOpen = false
        }
    },
    computed: {
        showMenuBtn() {
            return this.$route.name === 'wallet'
        }
    },
    methods: {
        onWalletChange(active: number) {
            this.leftDrawerOpen = false
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
