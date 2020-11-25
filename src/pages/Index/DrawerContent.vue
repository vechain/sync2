<template>
    <div
        class="fit column no-wrap"
        style="width: 300px !important"
    >
        <!-- drawer content header -->
        <q-toolbar>
            <q-avatar square>
                <img src="~assets/logoSync.svg">
            </q-avatar>
            <q-toolbar-title>
                Sync2
            </q-toolbar-title>
        </q-toolbar>

        <!-- wallet list -->
        <WalletList class="col" />

        <!-- drawer content footer -->
        <q-list>
            <q-item :to="{name: 'settings'}">
                <q-item-section avatar>
                    <q-icon
                        size="sm"
                        name="settings"
                    />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
            </q-item>
            <q-item :to="{name: 'activities'}">
                <q-item-section avatar>
                    <q-icon
                        size="sm"
                        name="history"
                    />
                </q-item-section>
                <q-item-section>Activities</q-item-section>
            </q-item>
        </q-list>
        <span class="full-width text-center text-grey text-caption">{{version}}</span>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import WalletList from './WalletList.vue'

export default Vue.extend({
    components: { WalletList },
    computed: {
        version() {
            return `v${process.env.APP_VERSION} (${process.env.APP_BUILD})`
        }
    }
})
</script>
