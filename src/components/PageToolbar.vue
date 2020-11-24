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
    </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        title: String,
        nav: Object as () => { icon: string, action: () => void }
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
