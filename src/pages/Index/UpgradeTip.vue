<template>
    <q-banner
        dark
        dense
        rounded
        inline-actions
        class="bg-positive q-mx-sm q-mb-sm"
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
