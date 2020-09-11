<template>
    <q-infinite-scroll
        @load="onLoad"
        :offset="0"
    >
        <div
            v-for="(item, index) in logs"
            :key="index"
            class="caption"
        >
            <LogItem
                :address="address"
                :key="index"
                :log="item"
            />
        </div>
        <div
            v-if="noMore"
            class="text-center q-my-md text-grey"
        >
            No More Transfers.
        </div>
        <template v-slot:loading>
            <div class="text-center q-my-sm">
                <q-spinner-dots
                    color="primary"
                    size="20px"
                />
            </div>
        </template>
    </q-infinite-scroll>
</template>
<script lang="ts">
import Vue from 'vue'
import { vetTransfers, tokenTransfers } from '../components/queries'

export default Vue.extend({
    props: {
        connex: Object as () => Connex,
        pageSize: Number,
        address: String,
        tokens: {
            type: Array as () => M.TokenSpec[],
            default: null
        }
    },
    data() {
        return {
            pageNum: 1,
            logs: [] as M.TransferLog[],
            offset: 0,
            noMore: false
        }
    },
    methods: {
        vetTransfers,
        tokenTransfers,
        async onLoad(index: number, done: (stop: boolean) => void) {
            const logs = await this.query((this.pageNum - 1) * this.pageSize)
            this.pageNum++
            this.logs = [...this.logs, ...logs]
            this.noMore = logs.length < this.pageSize
            done(logs.length < this.pageSize)
        },
        async query(offset: number) {
            const to = this.connex.thor.status.head.number
            if (this.tokens) {
                return await this.tokenTransfers(this.connex, this.tokens, this.address, to, offset, this.pageSize)
            } else {
                return await this.vetTransfers(this.connex, this.address, to, offset, this.pageSize)
            }
        }
    }
})
</script>
