<template>
    <q-banner
        dark
        dense
        :class="classes"
    >
        <template v-slot:avatar>
            <q-icon
                :name="icon"
                size="1em"
            />
        </template>
        <div
            v-if="alert.caption"
            class="text-caption"
        >{{alert.caption}}</div>
        <div>{{alert.message}}</div>
        <div
            v-if="alert.extra"
            class="text-italic text-caption"
        >{{alert.extra}}</div>
    </q-banner>
</template>
<script lang="ts">
import Vue from 'vue'

export type Alert = {
    type: 'error' | 'warn'
    caption?: string
    message: string
    extra?: string
}

export default Vue.extend({
    props: {
        alert: Object as () => Alert
    },
    computed: {
        classes() {
            switch (this.alert.type) {
                case 'error': return 'bg-negative'
                case 'warn':
                default: return 'bg-warning'
            }
        },
        icon() {
            switch (this.alert.type) {
                case 'error': return 'error'
                case 'warn':
                default: return 'warning'
            }
        }
    }
})
</script>
