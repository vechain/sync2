<template>
    <div class="q-pa-xs">
        <q-banner
            dark
            dense
            rounded
            inline-actions
            class="bg-positive"
        >
            <template v-slot:avatar>
                <q-icon name="upgrade" />
            </template>
            {{$t('index.msg_upgrade')}}
            <template v-slot:action>
                <q-btn
                    @click="reloadApp"
                    flat
                    :label="$t('index.action_upgrade')"
                />
            </template>
        </q-banner>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    methods: {
        reloadApp() {
            if (process.env.MODE === 'electron') {
                require('@electron/remote')
                    .app
                    .updater
                    .quitAndInstall()
            } else {
                window.location.reload(true)
            }
        }
    }
})
</script>
