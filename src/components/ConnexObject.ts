import Vue, { VNode } from 'vue'
import { retain, ConnexRef } from 'core/connex/pool'

/* example:
suppose
const node = {gid:'0x...', url:'https://...'}

<connex-object :node="node" v-slot="{connex, error}">
  <!-- here `connex` and `error` are ready to be accessed -->
</connex-object>

or

<connex-object :node="node" @ready="connex=$event" @error="error=$event" />
*/

export default Vue.extend({
    props: {
        tag: String,
        node: { type: Object as () => (M.Node | null) }
    },
    data: () => {
        return {
            connexRef: null as ConnexRef | null,
            error: null as Error | null
        }
    },
    methods: {
        async initConnex() {
            // reset all previous set data
            this.connexRef && this.connexRef.release()
            this.connexRef = null
            this.error = null

            if (!this.node) {
                return
            }

            const node = { ...this.node }

            // to check if node prop is changes
            const stale = () => !this.node || node.genesis.id !== this.node.genesis.id || node.url !== this.node.url

            do {
                try {
                    const connexRef = await retain({ gid: node.genesis.id, url: node.url })
                    if (stale()) {
                        // discard
                        connexRef.release()
                    } else {
                        this.connexRef = connexRef
                        this.error = null
                        this.$emit('ready', connexRef.connex)
                    }
                    break
                } catch (err) {
                    if (!stale()) {
                        this.error = err
                        this.$emit('error', err)
                        // take a delay and retry
                        await new Promise(resolve => setTimeout(resolve, 10 * 1000))
                    }
                }
            } while (!stale())
        }
    },
    watch: {
        node: {
            handler() {
                this.initConnex()
            },
            deep: true
        }
    },
    created() {
        this.initConnex()
    },
    beforeDestroy() {
        this.connexRef && this.connexRef.release()
        this.connexRef = null
    },
    render(h): VNode {
        const defaultSlot = this.$scopedSlots.default
        const children = (defaultSlot ? defaultSlot({
            connex: this.connexRef ? this.connexRef.connex : null,
            error: this.error
        }) : []) || []

        if (this.tag) {
            return h(this.tag, children)
        }
        return children.length > 1 ? h('fragment', children) : children[0]
    }
})
