import Vue, { VNode } from 'vue'
import { continuous } from 'core/connex/continuous'

/* example
<connex-continuous
  :connex="connex"
  :query="()=> connex.thor.block().get()"
  v-slot="{data, error}">

  <!-- here `data` and `error` are ready to be accessed -->
</connex-continuous>
*/

export default Vue.extend({
    props: {
        tag: { default: 'div' },
        connex: { type: Object as () => (Connex | null) },
        query: { type: Function as unknown as () => ((() => Promise<unknown>) | null) }
    },
    data: () => {
        return {
            data: null as unknown,
            error: null as Error | null,
            session: null as ReturnType<typeof continuous> | null
        }
    },
    methods: {
        stop() {
            this.session && this.session.stop()
            this.session = null
        },
        start() {
            this.stop()
            this.data = null
            this.error = null

            if (!this.connex || !this.query) {
                return
            }
            this.session = continuous(this.connex, this.query)
                .next(data => { this.data = data })
                .error(err => { this.error = err })
        }
    },
    watch: {
        connex() { this.start() },
        query() { this.start() }
    },
    created() {
        this.start()
    },
    beforeDestroy() {
        this.stop()
    },
    render(h): VNode {
        const defaultSlot = this.$scopedSlots.default
        const children = (defaultSlot ? defaultSlot({
            data: this.data,
            error: this.error
        }) : []) || []

        return children.length > 1 ? h(this.tag, children) : children[0]
    }
})
