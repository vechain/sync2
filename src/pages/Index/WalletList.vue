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
                    @click="$emit('select', wallet.id)"
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
        wallets(newVal: M.Wallet[], oldVal: M.Wallet[]) {
            if (newVal.length !== oldVal.length) {
                this.$nextTick(() => this.ensureCurrentInView())
            }
        },
        current() {
            this.ensureCurrentInView()
        }
    },
    methods: {
        ensureCurrentInView() {
            const item = this.$refs[this.current.toString()] as Vue[]
            if (item && item.length > 0) {
                item[0].$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
        }
    }
})
</script>
