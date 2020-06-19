<template>
    <q-separator
        v-scroll="y => this.y = y"
        :class="bottom?'absolute-bottom': 'absolute-top'"
        :style="style"
    />
</template>
<script lang="ts">
/* example
<div class="position-relative">
  <div class="fit overflow-auto">
    <scroll-divider />
    <scroll-divider bottom />
    ...
  </div>
</div>
*/
import Vue from 'vue'

export default Vue.extend({
    props: {
        bottom: Boolean
    },
    data: () => {
        return {
            y: 0
        }
    },
    computed: {
        opacity(): number {
            if (this.bottom) {
                if (!this.$el) {
                    return 0
                }
                const parent = this.$el.parentElement!
                const sHeight = parent.scrollHeight - parent.clientHeight
                return Math.min(Math.max(sHeight - this.y, 0), 10) / 10
            } else {
                return Math.min(Math.max(this.y, 0), 10) / 10
            }
        },
        style(): {} {
            return {
                opacity: this.opacity
            }
        }
    }
})
</script>
