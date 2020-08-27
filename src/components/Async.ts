import Vue, { VNode } from 'vue'

/*
<async :fn="someAsyncMethod or Promise object" v-slot="{data, lastData, error, pending, reload}" @data="..." @error="...">
    <!-- go go go -->
</async>
*/
export default Vue.extend({
    props: {
        tag: String,
        fn: { default: null as unknown as () => ((() => Promise<unknown>) | Promise<unknown>) }
    },
    data: () => {
        return {
            seq: 0,
            data: null as unknown,
            lastData: null as unknown,
            error: null as Error | null,
            pending: false
        }
    },
    methods: {
        async reload() {
            this.lastData = this.data
            this.data = null
            this.error = null

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
                        this.$emit('data', data)
                    }
                } catch (err) {
                    if (seq === this.seq) {
                        this.error = err
                        this.$emit('error', err)
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
            lastData: this.lastData,
            error: this.error,
            pending: this.pending,
            reload: () => this.reload()
        }) : []) || []

        return children.length > 1 ? h(this.tag || 'fragment', children) : children[0]
    }
})
