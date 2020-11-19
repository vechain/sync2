import Vue, { VNode } from 'vue'
import { continuous } from 'core/connex/continuous'

/* example
<connex-continuous
  :connex="connex"
  :query="()=> connex.thor.block().get()"
  v-slot="{data, lastData, error}" @data="..." @error="...">

  <!-- here `data` and `error` are ready to be accessed -->
</connex-continuous>
*/

export default Vue.extend({
    props: {
        tag: String,
        connex: { type: Object as () => (Connex | null) },
        query: { type: Function as unknown as () => ((() => Promise<unknown>) | null) }
    },
    data: () => {
        return {
            data: null as unknown,
            lastData: null as unknown,
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
            this.lastData = this.data
            this.data = null
            this.error = null

            if (!this.connex || !this.query) {
                return
            }
            this.session = continuous(this.connex, this.query)
                .next(data => {
                    this.lastData = this.data
                    this.data = data
                    this.$emit('data', data)
                })
                .error(err => {
                    this.error = err
                    this.$emit('error', err)
                })
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
            lastData: this.lastData,
            error: this.error
        }) : []) || []

        if (this.tag) {
            return h(this.tag, children)
        }
        return children.length > 1 ? h('fragment', children) : children[0]
    }
})
