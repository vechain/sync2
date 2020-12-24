<template>
    <q-list class="column fit">
        <q-item class="justify-center">
            <q-item-section thumbnail>
                <img src="~/assets/logo-sync.svg">
            </q-item-section>
        </q-item>
        <q-item-label
            header
            class="text-h6 text-dark"
        >Backup Tips</q-item-label>
        <q-item>
            <q-item-section>
                <q-item-label
                    class="text-body2"
                    lines="3"
                >The mnemonic words stores all the information that is needed at any point in time to recover your wallet</q-item-label>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section avatar>
                <q-avatar icon="mdi-pencil" />
            </q-item-section>
            <q-item-section>
                <q-item-label>Write it down in given order</q-item-label>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section avatar>
                <q-avatar icon="mdi-map-marker" />
            </q-item-section>
            <q-item-section>
                <q-item-label>Keep it in a secure place</q-item-label>
            </q-item-section>

        </q-item>
        <q-item>
            <q-item-section avatar>
                <q-avatar icon="mdi-camera-off" />
            </q-item-section>
            <q-item-section>
                <q-item-label>No screenshot or screen recording</q-item-label>
            </q-item-section>

        </q-item>
        <q-item class="col">
            <q-item-section>
                <q-btn
                    label="Start"
                    class="w40 q-mx-auto q-mt-auto"
                    unelevated
                    color="primary"
                    @click="$emit('start')"
                />
            </q-item-section>
        </q-item>
    </q-list>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
})
</script>
