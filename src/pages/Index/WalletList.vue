<template>
    <div class="column fit">
        <q-item>
            <q-item-section>{{$t('index.label_wallets')}}</q-item-section>
            <q-item-section side>
                <q-btn
                    flat
                    round
                    dense
                    icon="add"
                    :to="{name:'new-wallet'}"
                />
            </q-item-section>
        </q-item>
        <!-- the grouped wallet list -->
        <q-list
            class="col overflow-auto full-width"
            v-scrollDivider.both
        >
            <span
                class="absolute-center text-grey"
                v-if="walletGroups.length === 0"
            >{{$t('index.label_no_wallet')}}</span>
            <template v-for="(group, gi) in walletGroups">
                <q-item-label
                    header
                    class="text-capitalize"
                    :key="`h-${gi}`"
                >
                    {{$netDisplayName(group[0].gid)}}
                </q-item-label>
                <q-item
                    v-for="wallet in group"
                    :key="wallet.id"
                    :ref="wallet.id.toString()"
                    clickable
                    :inset-level="0.25"
                    :active="wallet.id === current"
                    active-class="bg-blue-1"
                    @click="onClickWalletItem(wallet.id)"
                >
                    <q-item-section>
                        <q-item-label lines="1">
                            {{wallet.meta.name}}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </template>
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { groupBy } from 'src/utils/array'

export default Vue.extend({
    model: {
        prop: 'current',
        event: 'select'
    },
    props: {
        wallets: Array as () => M.Wallet[],
        current: Number
    },
    computed: {
        walletGroups(): M.Wallet[][] {
            return groupBy(this.wallets, w => w.gid)
        }
    },
    watch: {
        current(newVal: number) {
            if (this.wallets.length > 0 && !this.wallets.find(w => w.id === newVal)) {
                this.$emit('select', this.wallets[0].id)
                this.scrollSelectedItemIntoView()
            }
        },
        wallets(newVal: M.Wallet[], oldVal: M.Wallet[]) {
            if (newVal.length > 0 && !newVal.find(w => w.id === this.current)) {
                this.$emit('select', newVal[0].id)
            }
            if (newVal.length !== oldVal.length) {
                this.$nextTick(() => this.scrollSelectedItemIntoView())
            }
        }
    },
    methods: {
        onClickWalletItem(id: number) {
            this.$emit('select', id)
        },
        scrollSelectedItemIntoView() {
            const item = this.$refs[this.current.toString()] as Vue[]
            if (item) {
                item[0].$el.scrollIntoView()
            }
        }
    }
})
</script>
