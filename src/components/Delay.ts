import Vue from 'vue'

/* example:
<delay :t="100">
  <!-- content rendering will be delayed in 100ms -->
</delay>
*/
export default Vue.extend({
    props: {
        t: Number
    },
    data: () => {
        return {
            timeUp: false
        }
    },
    created() {
        const timer = setTimeout(() => {
            this.timeUp = true
        }, this.t)
        this.$once('hook:beforeDestroy', () => clearTimeout(timer))
    },
    render(h) {
        if (this.timeUp) {
            const slots = this.$slots.default || []
            return slots.length > 1 ? h('fragment', slots) : slots[0]
        }
        return h()
    }
})
