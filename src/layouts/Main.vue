<template>
    <q-layout
        view="lHh Lpr lFf"
        v-if="isSetPasswordShadow"
    >
        <q-page-container>
            <StackedRouterView />
        </q-page-container>
    </q-layout>
    <wizard
        v-else
        @done="isSetPasswordShadow = true"
        class="fullscreen"
    />
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
            isSetPasswordShadow: !!this.$state.config.all.passwordShadow
        }
    }
})
</script>
