<template>
    <q-item
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-item-section avatar>
            <q-avatar :icon="icon" />
        </q-item-section>
        <q-item-section>
            <q-item-label lines="1">{{title}}</q-item-label>
        </q-item-section>
        <q-item-section side>
            {{value}}
        </q-item-section>
        <q-item-section side>
            <q-icon
                v-if="!$slots.default"
                name="keyboard_arrow_right"
            ></q-icon>
            <slot />
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        icon: String,
        title: String,
        value: String
    }
})
</script>
