<template>
    <q-banner
        inline-actions
        rounded
        class="text-white bg-orange q-mx-sm self-center q-my-sm"
    >
        Backup allows you to regain wallet access if you lose this device.
        <template v-slot:action>
            <q-btn
                flat
                :to="{name: 'backup'}"
                color="white"
                label="BACK UP"
            />
        </template>
    </q-banner>
</template>
