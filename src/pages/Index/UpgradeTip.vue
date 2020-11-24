<template>
    <q-banner
        dark
        dense
        inline-actions
        class="bg-positive"
    >
        <template v-slot:avatar>
            <q-icon name="upgrade" />
        </template>
        New version is ready :)
        <template v-slot:action>
            <q-btn
                @click="reloadApp"
                size="sm"
                flat
                label="Upgrade Now"
            />
        </template>
    </q-banner>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    methods: {
        reloadApp() {
            window.location.reload(true)
        }
    }
})
</script>
