<template>
    <div>
        <q-slide-transition>
            <div v-show="!dismissed">
                <div class="q-pa-xs">
                    <q-banner
                        dark
                        dense
                        rounded
                        class="bg-warning"
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
                                @click="$emit('backup')"
                            />
                        </template>
                    </q-banner>
                </div>
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
