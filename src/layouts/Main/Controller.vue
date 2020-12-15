<template>
    <transition
        v-if="passwordSet || !$asyncComputed.passwordSet.updating"
        name="q-transition--fade"
    >
        <StackedRouterView
            v-if="passwordSet"
            v-show="mounted"
        />
        <wizard
            v-else
            v-show="mounted"
            class="fullscreen"
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
            mounted: false
        }
    },
    asyncComputed: {
        passwordSet(): Promise<boolean> {
            return this.$svc.config.getPasswordShadow().then(r => !!r)
        },
        uncompleted(): Promise<M.Activity[]> {
            return this.$svc.activity.uncompleted()
        }
    },
    mounted() {
        this.mounted = true
    }
})
</script>
