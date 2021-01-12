<template>
    <q-card
        flat
        class="q-py-sm"
        v-on="$listeners"
    >
        <div
            v-for="(op, i) in ops"
            :key="i"
        >
            <q-separator
                v-if="i>0"
                inset
            />
            <q-item-label
                header
                class="q-py-sm text-caption"
            >{{opLabel(op)}}</q-item-label>
            <transfer-item
                v-if="op.type==='transfer'"
                :op="op"
            />
            <call-item
                v-if="op.type==='call'"
                :op="op"
            />
            <create-item
                v-if="op.type==='create'"
                :op="op"
            />
        </div>
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import TransferItem, { OpTransfer } from './TransferItem.vue'
import CallItem, { OpCall } from './CallItem.vue'
import CreateItem, { OpCreate } from './CreateItem.vue'
import BigNumber from 'bignumber.js'
import { decodeAsTokenTransferClause } from '../helper'

export default Vue.extend({
    components: { TransferItem, CallItem, CreateItem },
    props: {
        index: Number,
        clause: Object as () => Connex.Vendor.TxMessage[0],
        tokens: Array as () => M.TokenSpec[]
    },
    computed: {
        // convert clause into ops
        ops() {
            const ret: Array<OpTransfer | OpCall | OpCreate> = []
            const { to, value, data } = this.clause

            if (to) {
                if (data && data !== '0x') {
                    let isTokenTransfer = false
                    for (const spec of this.tokens) {
                        const r = decodeAsTokenTransferClause(this.clause, spec)
                        if (r) {
                            isTokenTransfer = true
                            // token transfer
                            ret.push({
                                type: 'transfer',
                                token: spec,
                                amount: new BigNumber(r.amount),
                                to: r.to
                            })
                            break
                        }
                    }
                    if (!isTokenTransfer) {
                        // contract call
                        ret.push({ type: 'call', to })
                    }
                }
            } else {
                // contract creation
                ret.push({ type: 'create' })
            }

            // vet transfer
            const vetSpec = this.tokens.find(t => t.symbol === 'VET')
            if (vetSpec) {
                const amount = new BigNumber(value)
                // when no op yet, append the VET transfer op even amount is zero
                if (!amount.isZero() || ret.length === 0) {
                    ret.unshift({
                        type: 'transfer',
                        token: vetSpec,
                        amount,
                        to
                    })
                }
            }
            return ret
        }
    },
    methods: {
        opLabel(op: OpTransfer | OpCall | OpCreate) {
            switch (op.type) {
                case 'transfer': return this.$t('common.transfer_asset')
                case 'call': return this.$t('common.contract_call')
                case 'create': return this.$t('common.contract_creation')
            }
        }
    }
})
</script>
