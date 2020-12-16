<template>
    <transition
        v-if="mounted"
        name="q-transition--fade"
    >
        <StackedRouterView
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

export default Vue.extend({
    components: {
        Wizard
    },
    data() {
        return {
            initialized: false,
            mounted: false
        }
    },
    asyncComputed: {
        uncompleted(): Promise<M.Activity[]> {
            return this.$svc.activity.uncompleted()
        }
    },
    async mounted() {
        this.initialized = await this.$svc.config.getPasswordShadow().then(r => !!r)
        this.mounted = true
    }
})
</script>
