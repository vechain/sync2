<template>
    <q-card
        flat
        class="q-py-sm"
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

import { abi } from 'thor-devkit'
import { abis } from 'src/consts'
import BigNumber from 'bignumber.js'

const TRANSFER_SIG = new abi.Function(abis.transfer).signature

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
            // contract creation
            if (!to) {
                ret.push({ type: 'create' })
            }

            const amount = new BigNumber(value)
            if (!amount.isZero()) {
                // vet transfer
                const spec = this.tokens.find(t => t.symbol === 'VET')
                spec && ret.push({
                    type: 'transfer',
                    token: spec,
                    amount,
                    to: to
                })
            }

            if (to && data) {
                const spec = this.tokens.find(t => t.address === to)
                // to check if it's token transfer
                if (data.startsWith(TRANSFER_SIG) && spec) {
                    try {
                        const decoded = abi.decodeParameters(abis.transfer.inputs, '0x' + data.slice(TRANSFER_SIG.length))
                        ret.push({
                            type: 'transfer',
                            token: spec,
                            amount: new BigNumber(decoded._value),
                            to: decoded._to
                        })
                    } catch {
                        ret.push({ type: 'call', to })
                    }
                } else if (data !== '0x') {
                    // contract call
                    ret.push({ type: 'call', to })
                }
            }
            return ret
        }
    },
    methods: {
        opLabel(op: OpTransfer | OpCall | OpCreate) {
            switch (op.type) {
                case 'transfer': return 'Transfer'
                case 'call': return 'Contract call'
                case 'create': return 'Contract creation'
            }
        }
    }
})
</script>
