import Vue from 'vue'
import { Transaction } from 'thor-devkit'

const CONFIRMED_N = 12

export default Vue.extend({
    props: {
        activity: Object as () => M.Activity
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.activity.gid).thor }
    },
    asyncComputed: {
        task: {
            async get(): Promise<void> {
                const a = this.activity
                if (a.type !== 'tx') {
                    return
                }

                const tx = Transaction.decode(Buffer.from(a.glob.encoded.slice(2), 'hex'))
                const headNum = this.thor.status.head.number

                const values: Parameters<Vue['$svc']['activity']['update']>[1] = {}

                // check receipt
                const receipt = await this.thor.transaction(tx.id!).getReceipt()
                if (receipt) {
                    values.glob = { ...a.glob, receipt }
                    if (headNum >= receipt.meta.blockNumber + CONFIRMED_N) {
                        values.status = 'completed'
                    }
                } else {
                    const expired = headNum > parseInt(tx.body.blockRef.slice(0, 10)) +
                        tx.body.expiration +
                        CONFIRMED_N

                    if (expired) {
                        values.status = 'completed'
                    } else {
                        this.$svc.bc(a.gid).commitTx(a.glob.encoded)
                    }
                }

                // update if needed
                if (Object.keys(values).length > 0) {
                    await this.$svc.activity.update(a.id, values)
                }
            },
            shouldUpdate() { return false }
        }
    },
    watch: {
        thor() {
            this.$asyncComputed.task.update()
        }
    },
    render(h) {
        return h()
    }
})
