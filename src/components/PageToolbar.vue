<template>
    <q-toolbar>
        <q-btn
            flat
            dense
            round
            :icon="nav? nav.icon : 'navigate_before'"
            @click="onClickNavButton()"
        >
        </q-btn>
        <q-toolbar-title class="absolute-center">{{title}}</q-toolbar-title>
        <!-- action buttons -->
        <slot />
        <div
            v-if="devMode"
            class="fixed-center z-top no-pointer-events q-pa-lg text-h2 text-no-wrap"
            style="background: rgba(0,0,0,0.25);color: rgba(255,0,0,0.8)"
        >
            Dev Mode
        </div>
    </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        title: String,
        nav: Object as () => { icon: string, action: () => void },
        gid: String // to check if in dev mode
    },
    computed: {
        devMode(): boolean {
            if (this.gid) {
                return this.$options.filters!.net(this.gid) !== 'main'
            }
            return false
        }
    },
    methods: {
        onClickNavButton() {
            if (this.nav) {
                this.nav.action()
            } else {
                this.$stack.canGoBack ? this.$router.back() : this.$router.replace('/')
            }
        }
    }
})
</script>
