<template>
    <div
        class="fixed fullscreen column flex-center z-max no-outline"
        v-nofocusout
    >
        <delay :t="250">
            <transition
                name="q-transition--fade"
                appear
            >
                <q-spinner-ios
                    :size="80"
                    color="black"
                />
            </transition>
        </delay>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { QSpinnerIos } from 'quasar'
import Delay from './Delay'

export default Vue.extend({
    components: { QSpinnerIos, Delay },
    mounted() {
        (this.$el as HTMLElement).focus()
    }
})
</script>
