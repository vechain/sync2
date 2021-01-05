<template>
    <transition
        v-if="mounted"
        name="q-transition--fade"
    >
        <fragment v-if="initialized">
            <stacked-router-view class="fit" />
            <activity-status-updater />
            <transfer-notifier
                v-for="gid in gids"
                :key="gid"
                :gid="gid"
            />
        </fragment>
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
import ActivityStatusUpdater from 'pages/ActivityStatusUpdater'
import TransferNotifier from 'pages/TransferNotifier'
import { groupBy } from 'src/utils/array'

export default Vue.extend({
    components: { Wizard, StackedRouterView, ActivityStatusUpdater, TransferNotifier },
    data() {
        return {
            initialized: false,
            mounted: false
        }
    },
    asyncComputed: {
        async gids(): Promise<string[]> {
            const nodes = await this.$svc.config.node.all()
            return groupBy(nodes, n => n.genesis.id).map(g => g[0].genesis.id)
        }
    },
    async mounted() {
        this.initialized = await this.$svc.config.getPasswordShadow().then(r => !!r)
        this.mounted = true
    }
})
</script>
