<template>
    <ConnexObject
        :node="node"
        v-slot="{connex}"
    >
        <ConnexContinuous
            v-if="connex"
            :connex="connex"
            :query="()=> txReceipt(connex, tx.id)"
            @data="onReceipt(connex, $event)"
        >
        </ConnexContinuous>
    </ConnexObject>
</template>
<script lang="ts">
import Vue from 'vue'
import { txReceipt } from '../queries'

export default Vue.extend({
    props: {
        item: Object as () => M.Activity<'tx'>
    },
    computed: {
        node(): M.Node | undefined {
            return this.$state.config.node.list.find(item => {
                return item.gid === this.item.gid
            })
        },
        isCompleted(): boolean {
            return this.item.status === 'completed'
        },
        tx(): M.Activity.Tx {
            return this.item.glob
        }
    },
    methods: {
        txReceipt,
        async onReceipt(connex: Connex, receipt: Connex.Thor.Transaction.Receipt) {
            if (!this.isCompleted) {
                const head = connex.thor.status.head
                const confirmed = receipt ? head.number - receipt.meta.blockNumber >= 12 : false
                const expired = !receipt && (head.timestamp - this.tx.timestamp > 18 * 10 + 10)
                await this.$storage.activities.update({
                    id: this.item.id
                }, {
                    status: (confirmed || expired) ? 'completed' : '',
                    glob: JSON.stringify({
                        ...this.item.glob,
                        receipt: receipt
                    })
                })
            }
        }
    }
})
</script>
