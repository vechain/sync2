<template>
    <div>
        <transition
            v-if="mounted"
            appear
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
        <template v-if="initialized">
            <activity-status-updater />
            <transfer-notifier
                v-for="gid in gids"
                :key="gid"
                :gid="gid"
            />
        </template>
        <disclaimer />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Wizard from 'pages/Wizard'
import StackedRouterView from 'components/StackedRouterView.vue'
import ActivityStatusUpdater from 'pages/ActivityStatusUpdater'
import TransferNotifier from 'pages/TransferNotifier.vue'
import { unique } from 'src/utils/array'
import Disclaimer from './Disclaimer'

export default Vue.extend({
    components: { Wizard, StackedRouterView, ActivityStatusUpdater, TransferNotifier, Disclaimer },
    data() {
        return {
            initialized: false,
            mounted: false
        }
    },
    asyncComputed: {
        async gids(): Promise<string[]> {
            const wallets = await this.$svc.wallet.all()
            return unique(wallets.map(w => w.gid))
        }
    },
    async mounted() {
        this.initialized = await this.$svc.config.getUserMasterKeyGlob().then(r => !!r)
        this.mounted = true
    }
})
</script>
