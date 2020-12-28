<template>
    <div
        v-scrollDivider.both
        class="overflow-auto"
        :class="{'q-pa-md': padding}"
    >
        <div
            class="q-mx-auto"
            :class="innerClass"
            :style="innerStyle"
        >
            <slot />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        size: String as () => 'xs' | 'sm' | 'md' | 'lg' | 'xl',
        padding: Boolean,
        innerClass: String
    },
    computed: {
        innerStyle(): object {
            const size = this.size || 'sm'
            const maxWidth = size === 'xs' ? this.$q.screen.sizes.sm * 0.8 : this.$q.screen.sizes[size]
            return {
                width: '100%',
                maxWidth: `${maxWidth}px`
            }
        }
    }
})
</script>
