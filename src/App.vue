<template>
    <div id="q-app" class="non-selectable">
        <router-view v-if="ready" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    computed: {
        ready() {
            return this.$state.wallet.ready &&
                this.$state.config.ready
        }
    },
    created() {
        console.log('[Sync2]', `v${process.env.APP_VERSION} (${process.env.APP_BUILD})`)
    }
})
</script>
