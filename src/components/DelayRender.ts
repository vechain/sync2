import Vue from 'vue'

/* example:
<delay-render :t="100">
  <!-- content rendering will be delayed in 100ms -->
</delay-render>
*/
export default Vue.extend({
    props: {
        tag: String,
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
            if (this.tag) {
                return h(this.tag, slots)
            }
            return slots.length > 1 ? h('fragment', slots) : slots[0]
        }
        return h()
    }
})
