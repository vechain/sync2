<template>
    <q-slide-transition>
        <div v-show="show">
            <q-banner
                dark
                dense
                rounded
                class="bg-warning text-white q-mx-sm q-mb-sm"
            >
                Backup allows you to regain wallet access if you lose this device.
                <template v-slot:action>
                    <q-btn
                        flat
                        label="Dismiss"
                        @click="show=false"
                    />
                    <q-btn
                        flat
                        label="Backup"
                        :to="{name: 'backup'}"
                    />
                </template>
            </q-banner>
        </div>
    </q-slide-transition>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data: () => {
        return {
            show: true
        }
    }
})
</script>
