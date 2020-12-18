import Vue from 'vue'
import { Transaction } from 'thor-devkit'

const CONFIRMED_N = 12

export default Vue.extend({
    props: {
        activity: Object as () => M.Activity
    },
    asyncComputed: {
        // it will be called on blockchain tick
        async job(): Promise<void> {
            const a = this.activity
            if (a.type !== 'tx') {
                return
            }

            const tx = Transaction.decode(Buffer.from(a.glob.encoded.slice(2), 'hex'))
            const bc = this.$svc.bc(a.gid)
            const head = bc.thor.status.head

            const values: Parameters<Vue['$svc']['activity']['update']>[1] = {}

            // check receipt
            const receipt = await bc.thor.transaction(tx.id!).getReceipt()
            if (receipt) {
                values.glob = { ...a.glob, receipt }
                if (head.number >= receipt.meta.blockNumber + CONFIRMED_N) {
                    values.status = 'completed'
                }
            } else {
                const expired = head.number > parseInt(tx.body.blockRef.slice(0, 10)) +
                    tx.body.expiration +
                    CONFIRMED_N

                if (expired) {
                    values.status = 'completed'
                } else {
                    bc.commitTx(a.glob.encoded)
                }
            }

            // update if needed
            if (Object.keys(values).length > 0) {
                await this.$svc.activity.update(a.id, values)
            }
        }
    },
    render(h) {
        return h()
    }
})
