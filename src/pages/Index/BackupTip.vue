<template>
    <div>
        <q-slide-transition>
            <div v-show="!dismissed">
                <q-banner
                    dark
                    dense
                    rounded
                    class="bg-warning text-white"
                >
                    {{$t('index.msg_backup')}}
                    <template v-slot:action>
                        <q-btn
                            flat
                            :label="$t('common.dismiss')"
                            @click="dismissed=true"
                        />
                        <q-btn
                            flat
                            :label="$t('index.action_backup_now')"
                            :to="{name: 'backup'}"
                        />
                    </template>
                </q-banner>
            </div>
        </q-slide-transition>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data: () => {
        return {
            dismissed: false
        }
    }
})
</script>
