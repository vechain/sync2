<template>
    <q-infinite-scroll
        @load="onLoad"
        :offset="0"
    >
        <div
            v-for="(item, index) in logs"
            :key="index"
        >
            <TransactionItem
                class="q-my-sm"
                :address="address"
                :signer="signer"
                :confirmationsRequired="confirmationsRequired"
                :gid="gid"
                :walletId="walletId"
                :log="item"
            />
            <q-separator inset="item" />
        </div>
        <div
            v-if="noMore"
            class="text-center q-my-md text-grey"
        >
            <span v-if="logs.length === 0">{{$t('asset.msg_no_history')}}</span>
            <span
                class="text-caption"
                v-else
            >{{$t('asset.msg_no_more')}}</span>
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
import { submitTransactions } from './queries'
import { MultiSigTransactionLog } from '../models'
import TransactionItem from './TransactionItem.vue'

export default Vue.extend({
    components: {
        TransactionItem
    },
    props: {
        pageSize: Number,
        confirmationsRequired: Number,
        address: String,
        signer: String,
        walletId: String,
        gid: String
    },
    data() {
        return {
            pageNum: 1,
            logs: [] as MultiSigTransactionLog[],
            offset: 0,
            noMore: false,
            splitBlock: null as unknown as number
        }
    },
    asyncComputed: {
        recentList: {
            async get() {
                let on = true
                let list: MultiSigTransactionLog[] = []
                const from = (this.logs.length ? this.logs[0].meta.blockNumber : this.splitBlock) + 1
                const to = 2 ** 32 - 1
                while (on) {
                    const r = await this.query(from, to, list.length)
                    on = r.length === this.pageSize
                    list = [...list, ...r]
                }
                return list
            },
            default: []
        }
    },
    created() {
        this.splitBlock = this.$svc.bc(this.gid).thor.status.head.number
    },
    watch: {
        recentList(data: MultiSigTransactionLog[]) {
            if (data.length) {
                this.logs = [...data, ...this.logs]
            }
        }
    },
    methods: {
        submitTransactions,
        onNewLogs(data: MultiSigTransactionLog[]) {
            if (data.length) {
                this.logs = [...data, ...this.logs]
            }
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
            if (fb >= tb) {
                return []
            }
            return await this.submitTransactions(this.$svc.bc(this.gid).thor, this.address, fb, tb, offset, this.pageSize)
        }
    }
})
</script>
