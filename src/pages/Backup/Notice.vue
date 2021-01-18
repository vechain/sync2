<template>
    <q-list>
        <q-item class="justify-center">
            <q-item-section>
                <img src="~/assets/backup.svg">
            </q-item-section>
        </q-item>
        <q-item-label
            header
            class="text-h6 text-dark"
        >{{$t('backup.label_backup_tips')}}</q-item-label>
        <q-item>
            <q-item-section>
                <q-item-label
                    class="text-body2"
                    lines="3"
                >{{$t('backup.msg_backup_intro')}}</q-item-label>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section avatar>
                <q-avatar icon="create" />
            </q-item-section>
            <q-item-section>
                <q-item-label>{{$t('backup.msg_backup_tips_1')}}</q-item-label>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section avatar>
                <q-avatar icon="place" />
            </q-item-section>
            <q-item-section>
                <q-item-label>{{$t('backup.msg_backup_tips_2')}}</q-item-label>
            </q-item-section>

        </q-item>
        <q-item>
            <q-item-section avatar>
                <q-avatar icon="no_photography" />
            </q-item-section>
            <q-item-section>
                <q-item-label>{{$t('backup.msg_backup_tips_3')}}</q-item-label>
            </q-item-section>
        </q-item>
    </q-list>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
})
</script>
