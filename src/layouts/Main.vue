<template>
    <transition name="q-transition--fade">
        <q-layout
            v-if="isSetPasswordShadow"
            v-show="mounted"
        >
            <q-page-container>
                <StackedRouterView />
            </q-page-container>
        </q-layout>
        <wizard
            v-else
            v-show="mounted"
            @done="isSetPasswordShadow = true"
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
            isSetPasswordShadow: !!this.$state.config.all.passwordShadow,
            mounted: false
        }
    },
    mounted() {
        this.mounted = true
    }
})
</script>
