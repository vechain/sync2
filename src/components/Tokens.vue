<template>
    <q-list>
        <template v-for="i in 6">
            <q-item :key="i">
                <q-item-section avatar>
                    <q-avatar>
                        <img src="https://cdn.quasar.dev/img/avatar2.jpg">
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label lines="1">VET</q-item-label>
                    <q-item-label
                        caption
                        lines="2"
                    >
                        VeChainCoin
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    {{(12312313).toLocaleString()}}
                </q-item-section>
            </q-item>
            <q-separator
                v-if="i !== 6"
                :key="i + 's'"
                inset="item"
            />
        </template>
    </q-list>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>
