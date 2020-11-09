<template>
    <q-infinite-scroll
        @load="onLoad"
        :offset="0"
    >
        <ConnexContinuous
            @data="onNewLogs"
            :connex="connex"
            :query="() => fetchRecent()"
        />
        <div
            v-for="(item, index) in logs"
            :key="index"
        >
            <LogItem
                class="q-my-sm"
                :address="address"
                :log="item"
            />
            <q-separator inset="item" />
        </div>
        <div
            v-if="noMore"
            class="text-center q-my-md text-grey"
        >
            <span v-if="logs.length === 0"> No Transfer Found. </span>
            <span v-else> No More Transfers. </span>
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
            noMore: false,
            splitBlock: null as unknown as number
        }
    },
    created() {
        this.splitBlock = this.connex.thor.status.head.number
    },
    methods: {
        vetTransfers,
        tokenTransfers,
        onNewLogs(data: M.TransferLog[]) {
            if (data.length) {
                this.logs = [...data, ...this.logs]
            }
        },
        async fetchRecent() {
            let on = true
            let list: M.TransferLog[] = []
            const from = (this.logs.length ? this.logs[0].meta.blockNumber : this.splitBlock) + 1
            const to = this.connex.thor.status.head.number
            while (on) {
                const r = await this.query(from, to, list.length)
                on = r.length === this.pageSize
                list = [...list, ...r]
            }
            return list
        },
        async onLoad(index: number, done: (stop: boolean) => void) {
            try {
                const logs = await this.query(0, this.splitBlock, (this.pageNum - 1) * this.pageSize)
                this.pageNum++
                this.logs = [...this.logs, ...logs]
                this.noMore = logs.length < this.pageSize
                done(logs.length < this.pageSize)
            } catch (error) {
                // TODO error
                console.log(error)
                done(true)
            }
        },
        async query(fb: number, tb: number, offset: number) {
            if (this.tokens) {
                return await this.tokenTransfers(this.connex, this.tokens, this.address, fb, tb, offset, this.pageSize)
            } else {
                return await this.vetTransfers(this.connex, this.address, fb, tb, offset, this.pageSize)
            }
        }
    }
})
</script>
