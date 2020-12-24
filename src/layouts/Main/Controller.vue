<template>
    <transition
        v-if="mounted"
        name="q-transition--fade"
    >
        <stacked-router-view
            v-if="initialized"
            class="fit"
        />
        <wizard
            v-else
            class="fit"
            @done="initialized=true"
        />
    </transition>
</template>
<script lang="ts">
import Vue from 'vue'
import Wizard from 'pages/Wizard'
import StackedRouterView from 'components/StackedRouterView.vue'

export default Vue.extend({
    components: { Wizard, StackedRouterView },
    data() {
        return {
            initialized: false,
            mounted: false
        }
    },
    async mounted() {
        this.initialized = await this.$svc.config.getPasswordShadow().then(r => !!r)
        this.mounted = true
    }
})
</script>
