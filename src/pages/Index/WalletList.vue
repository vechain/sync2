<template>
    <div class="column fit">
        <q-item>
            <q-item-section>Wallets</q-item-section>
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
            <template v-for="(wallet, i) in sortedWallets">
                <q-item-label
                    header
                    class="text-capitalize"
                    v-if="i === 0 || wallet.gid !== sortedWallets[i-1].gid"
                    :key="wallet.id + '-' + 'section'"
                >
                    {{wallet.gid | net}} net
                </q-item-label>
                <q-item
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
        sortedWallets() {
            const gids: string[] = []
            this.wallets.forEach(w => gids.includes(w.gid) || gids.push(w.gid))
            return [...this.wallets].sort((a, b) => {
                return gids.indexOf(a.gid) - gids.indexOf(b.gid)
            })
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
                { label: 'Create Wallet', onClick: () => { this.openGenerateDialog('create') } },
                { label: 'Import Wallet', onClick: () => { this.openGenerateDialog('import') } }
            ])
        },
        openGenerateDialog(type: 'import' | 'create') {
            this.$q.dialog({
                component: WalletGenerateDialog,
                type
            })
        }
    }
})
</script>
