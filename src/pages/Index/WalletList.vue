<template>
    <div class="column">
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
            <template v-for="(wallet, i) in wallets">
                <q-item-label
                    header
                    class="text-capitalize"
                    v-if="i === 0 || wallet.gid !== wallets[i-1].gid"
                    :key="wallet.id + '-' + 'section'"
                >
                    {{wallet.gid | net}} net
                </q-item-label>
                <q-item
                    :key="wallet.id"
                    clickable
                    :inset-level="0.25"
                    :active="wallet.id === $state.wallet.current.id"
                    active-class="bg-blue-1"
                    @click="onClickWallet(wallet.id)"
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
import { gids } from 'src/consts'
import WalletGenerateDialog from 'pages/WalletGenerateDialog'

export default Vue.extend({
    computed: {
        wallets() {
            const weights = {
                [gids.main]: 2,
                [gids.test]: 1
            }
            return [...this.$state.wallet.list].sort((a, b) => {
                return (weights[b.gid] || 0) - (weights[a.gid] || 0)
            })
        }
    },
    methods: {
        onClickWallet(id: number) {
            this.$state.wallet.setCurrentId(id)
        },
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
