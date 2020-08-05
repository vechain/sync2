import Vue, { VNode } from 'vue'

/*
<async :fn="someAsyncMethod or Promise object" v-slot="{data, error, pending, reload}" @resolve="..." @reject="...">
    <!-- go go go -->
</async>
*/
export default Vue.extend({
    props: {
        fn: Object as unknown as () => ((() => Promise<unknown>) | Promise<unknown>),
        sticky: Boolean // set true to make slot data sticky when fn changed
    },
    data: () => {
        return {
            seq: 0,
            data: null as unknown,
            error: null as Error | null,
            pending: false
        }
    },
    methods: {
        async reload() {
            if (!this.sticky) {
                this.data = null
                this.error = null
            }

            this.pending = false
            const seq = ++this.seq

            if (this.fn) {
                this.pending = true

                try {
                    let data
                    if (typeof this.fn === 'function') {
                        data = await this.fn()
                    } else {
                        data = await this.fn
                    }
                    if (seq === this.seq) {
                        this.data = data
                        this.$emit('resolve', data)
                    }
                } catch (err) {
                    if (seq === this.seq) {
                        this.error = err
                        this.$emit('reject', err)
                    }
                } finally {
                    if (seq === this.seq) {
                        this.pending = false
                    }
                }
            }
        }
    },
    watch: {
        fn: {
            immediate: true,
            handler() {
                this.reload()
            }
        }
    },
    render(h): VNode {
        const defaultSlot = this.$scopedSlots.default
        const children = (defaultSlot ? defaultSlot({
            data: this.data,
            error: this.error,
            pending: this.pending,
            reload: () => this.reload()
        }) : []) || []

        return children.length > 1 ? h('fragment', children) : children[0]
    }
})
