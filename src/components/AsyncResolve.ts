import Vue, { VNode } from 'vue'

/*
<async-resolve tag="div" :promise="promiseObject" v-slot="{data, state}">
    <!-- go go go -->
</async-resolve>
*/
export default Vue.extend({
    props: {
        tag: String,
        promise: Promise as unknown as () => (Promise<unknown> | null)
    },
    asyncComputed: {
        data(): Promise<unknown> {
            if (!this.promise) {
                return Promise.resolve(this.data)
            }
            return this.promise
        }
    },
    render(h): VNode {
        const defaultSlot = this.$scopedSlots.default
        const children = (defaultSlot ? defaultSlot({
            data: this.data,
            state: this.$asyncComputed.data
        }) : []) || []

        if (this.tag) {
            return h(this.tag, children)
        }
        return children.length > 1 ? h('fragment', children) : children[0]
    }
})
