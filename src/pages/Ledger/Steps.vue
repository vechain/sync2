<template>
    <q-list>
        <q-item>
            <q-item-section class="flex-center">
                <q-img
                    width="60%"
                    src="~assets/ledger-device.svg"
                />
            </q-item-section>
        </q-item>
        <!-- steps -->
        <q-item
            v-for="(t, i) in titles"
            :key="i"
            :class="{invisible: i > step}"
        >
            <q-item-section avatar>
                <template v-if="i === step">
                    <q-icon
                        v-if="error"
                        size="xs"
                        name="error"
                    />
                    <q-spinner v-else />
                </template>
                <q-icon
                    v-else-if="i < step"
                    size="xs"
                    name="done"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label :class="{'text-grey': i >= step}">
                    {{t}}
                </q-item-label>
            </q-item-section>
        </q-item>
        <!-- hint -->
        <q-item>
            <q-item-section>
                <q-item-label
                    v-if="!!error"
                    class="text-negative"
                >
                    {{error.message}}
                </q-item-label>
                <q-item-label v-else>
                    {{hint}}
                </q-item-label>
            </q-item-section>
        </q-item>
    </q-list>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        titles: Array as () => string[],
        step: Number,
        hint: String,
        error: Object as () => Error
    }
})
</script>
