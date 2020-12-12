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
                    @click="onClickAddWallet"
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
            >No Wallet</span>
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
                    clickable
                    :inset-level="0.25"
                    :active="wallet.id === value"
                    active-class="bg-blue-1"
                    @click="$emit('input', wallet.id)"
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
import WalletGenerateDialog from 'pages/WalletGenerateDialog'
import { groupBy } from 'src/utils/array'

export default Vue.extend({
    props: {
        wallets: Array as () => M.Wallet[],
        value: Number // selected wallet id
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    computed: {
        walletGroups() {
            return groupBy(this.wallets, w => w.gid)
        }
    },
    watch: {
        wallets(newVal: M.Wallet[]) {
            if (!newVal.find(w => w.id === this.value)) {
                const w0 = newVal[0]
                w0 && this.$emit('input', w0.id)
            }
        }
    },
    methods: {
        onClickAddWallet() {
            this.$actionSheets([
                { label: this.$t('index.action_create').toString(), onClick: () => { this.openGenerateDialog('create') } },
                { label: this.$t('index.action_import').toString(), onClick: () => { this.openGenerateDialog('import') } }
            ])
        },
        openGenerateDialog(type: 'import' | 'create') {
            this.$q.dialog({
                parent: this,
                component: WalletGenerateDialog,
                type
            })
        }
    }
})
</script>
