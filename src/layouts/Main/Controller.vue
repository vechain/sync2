<template>
    <transition
        v-if="passwordSet || !$asyncComputed.passwordSet.updating"
        name="q-transition--fade"
    >
        <q-layout
            v-if="passwordSet"
            v-show="mounted"
        >
            <q-page-container>
                <StackedRouterView />
            </q-page-container>
        </q-layout>
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
        uncompleted(): Promise<M.Activity<'tx' | 'cert'>[]> {
            return this.$svc.activity.uncompleted()
        }
    },
    mounted() {
        this.mounted = true
    }
})
</script>
