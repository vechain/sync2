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
                    :active="wallet.id === selectedWalletId"
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
    props: {
        wallets: Array as () => M.Wallet[]
    },
    computed: {
        walletGroups(): M.Wallet[][] {
            return groupBy(this.wallets, w => w.gid)
        }
    },
    asyncComputed: {
        selectedWalletId(): Promise<number> {
            return this.$svc.config.getSelectedWalletId()
        }
    },
    methods: {
        onClickWalletItem(id: number) {
            if (id === this.selectedWalletId) {
                return
            }
            this.$svc.config.saveSelectedWalletId(id)
            this.$emit('select')
        }
    }
})
</script>
