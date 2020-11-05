<template>
    <q-item
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-item-section avatar>
            <q-icon name="credit_card" />
        </q-item-section>
        <q-item-section class="relative-position">
            <q-item-label lines="1">
                {{name}}
            </q-item-label>
            <q-badge
                v-show="badgeText"
                transparent
                color="orange"
                floating
                class="text-capitalize"
            >{{badgeText}}</q-badge>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        name: String,
        net: String
    },
    computed: {
        badgeText(): string {
            if (this.net === 'main') {
                return ''
            }
            return (this.net || 'private') + ' net'
        }
    }
})
</script>
