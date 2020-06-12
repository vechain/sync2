<template>
    <component
        :is="tag"
        v-intersection="options"
    >
        <slot :intersecting="intersecting" />
    </component>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        tag: { default: 'div' },
        root: String // the root element id
    },
    data: () => {
        return {
            intersecting: false
        }
    },
    computed: {
        rootElement(): Element | undefined {
            if (!this.root) {
                return undefined
            }
            let el: Element | null = this.$parent.$el
            while (el) {
                if (el.id === this.root) {
                    return el
                }
                el = el.parentElement
            }
            return undefined
        },
        options(): {} {
            return {
                handler: (entry: { isIntersecting: boolean }) => { this.intersecting = entry.isIntersecting },
                cfg: {
                    root: this.rootElement
                }
            }
        }
    }
})
</script>
