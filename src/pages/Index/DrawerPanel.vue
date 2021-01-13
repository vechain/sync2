<template>
    <div
        class="fit column no-wrap"
        style="width: 300px !important;max-width:80vw"
    >
        <!-- drawer content header -->
        <q-toolbar>
            <q-avatar square>
                <img src="~assets/sync-logo.svg">
            </q-avatar>
            <q-toolbar-title>
                Sync2
                <q-badge
                    v-if="distTag"
                    outline
                    color="warning"
                    align="top"
                >{{distTag}} </q-badge>
            </q-toolbar-title>
        </q-toolbar>
        <!-- content slot -->
        <div class="col">
            <slot />
        </div>
        <!-- drawer content footer -->
        <q-list padding>
            <q-item :to="{name: 'settings'}">
                <q-item-section avatar>
                    <q-icon
                        size="sm"
                        name="mdi-settings"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{$t('index.action_settings')}}</q-item-label>
                </q-item-section>
            </q-item>
            <q-item :to="{name: 'activities'}">
                <q-item-section avatar>
                    <q-icon
                        size="sm"
                        name="mdi-history"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{$t('index.action_activities')}}</q-item-label>
                </q-item-section>
                <q-item-section
                    v-if="ongoingActivitiesCount>0"
                    side
                >
                    <q-badge
                        color="red"
                        class="q-mr-md"
                    >{{ongoingActivitiesCount}}</q-badge>
                </q-item-section>
            </q-item>
            <q-item dense>
                <q-item-section class="text-center">
                    <q-item-label
                        caption
                        class="ellipsis"
                    >v{{version}} ({{build}})</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    computed: {
        distTag(): string {
            switch (process.env.DIST_TAG) {
                case 'preview': return 'Preview'
                case 'unstable': return 'Unstable'
                default: return ''
            }
        },
        version(): string {
            return process.env.APP_VERSION!
        },
        build(): string {
            return process.env.APP_BUILD!
        }
    },
    asyncComputed: {
        ongoingActivitiesCount() {
            return this.$svc.activity.uncompleted().then(r => r.length)
        }
    }
})
</script>
