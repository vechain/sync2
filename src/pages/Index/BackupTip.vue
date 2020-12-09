<template>
    <q-slide-transition>
        <div v-show="show">
            <q-banner
                dark
                dense
                rounded
                class="bg-warning text-white q-mx-sm q-mb-sm"
            >
            {{$t('index.msg_backupTip')}}
                <template v-slot:action>
                    <q-btn
                        flat
                        :label="$t('index.action_backupTip_dismiss')"
                        @click="show=false"
                    />
                    <q-btn
                        flat
                        :label="$t('index.action_backupTip_backup')"
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
