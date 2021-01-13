<template>
    <q-infinite-scroll
        @load="onLoad"
        :offset="0"
    >
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
import { vetTransfers, tokenTransfers } from './queries'
import { TransferLogItem } from './models'
import LogItem from './LogItem.vue'

export default Vue.extend({
    components: {
        LogItem
    },
    props: {
        pageSize: Number,
        address: String,
        token: Object as () => M.TokenSpec
    },
    data() {
        return {
            pageNum: 1,
            logs: [] as TransferLogItem[],
            offset: 0,
            noMore: false,
            splitBlock: null as unknown as number
        }
    },
    asyncComputed: {
        recentList: {
            async get() {
                let on = true
                let list: TransferLogItem[] = []
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
    computed: {
        gid() {
            return this.token && this.token.gid
        }
    },
    created() {
        this.splitBlock = this.$svc.bc(this.gid).thor.status.head.number
    },
    watch: {
        recentList(data: TransferLogItem[]) {
            if (data.length) {
                this.logs = [...data, ...this.logs]
            }
        }
    },
    methods: {
        vetTransfers,
        tokenTransfers,
        onNewLogs(data: TransferLogItem[]) {
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
            if (this.token && this.token.symbol !== 'VET') {
                return await this.tokenTransfers(this.$svc.bc(this.gid).thor, [this.token], this.address, fb, tb, offset, this.pageSize)
            } else {
                return await this.vetTransfers(this.$svc.bc(this.gid).thor, this.token, this.address, fb, tb, offset, this.pageSize)
            }
        }
    }
})
</script>
