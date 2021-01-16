<template>
    <q-toolbar>
        <q-btn
            v-show="!$q.screen.xs"
            flat
            dense
            round
            icon="mdi-close"
            v-close-popup
        />
        <q-toolbar-title class="text-center">
            <slot />
        </q-toolbar-title>
        <!-- a placeholder to make title centered -->
        <q-btn
            v-show="!$q.screen.xs"
            class="invisible"
            flat
            dense
            round
        />
    </q-toolbar>
</template>
