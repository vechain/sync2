<template>
    <q-item
        v-bind="$attrs"
        v-on="$listeners"
        :class="classes"
        :dark="!invert"
    >
        <q-item-section avatar>
            <q-icon :name="icon" />
        </q-item-section>
        <q-item-section v-if="error">
            <q-item-label>
                {{error.name}}
            </q-item-label>
            <q-item-label caption>
                {{error.message}}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        type: String as () => 'error' | 'warning',
        error: Object as () => Error,
        invert: Boolean
    },
    computed: {
        icon() {
            switch (this.type) {
                case 'warning': return 'warning'
                default: return 'error'
            }
        },
        classes() {
            if (this.invert) {
                switch (this.type) {
                    case 'warning': return 'text-warning'
                    default: return 'text-negative'
                }
            } else {
                switch (this.type) {
                    case 'warning': return 'bg-warning'
                    default: return 'bg-negative'
                }
            }
        }
    }
})
</script>
