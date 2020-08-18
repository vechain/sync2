<template>
    <q-dialog
        content-class="selector-dialog"
        ref="dialog"
        position="bottom"
    >
        <q-card
            style="padding-top: 50px"
            class="overflow-hidden fit"
        >
            <q-toolbar class="absolute-top">
                <q-toolbar-title>Select</q-toolbar-title>
            </q-toolbar>
            <q-card-section
                v-scrollDivider
                class="fit overflow-auto q-pt-none"
            >
                <ConnexObject
                    v-slot="{connex}"
                    :node="node"
                >
                    <AccountSelector
                        :wallets="wallets"
                        v-model="signer"
                        v-slot="{account}"
                        @tabChange="AccountTabChange"
                        @change="signerChange"
                    >
                        <q-list v-if="currentAccountTab === account">
                            <connex-continuous
                                :connex="connex"
                                :query="() => connex.thor.account(account).get()"
                                v-slot="{data}"
                            >
                                <TokenBalanceItem
                                    dense
                                    :balance="data && data.balance"
                                    :token="{symbol: 'VET', name: 'VeChain', decimals: 18}"
                                />
                                <q-separator inset="item" />
                                <TokenBalanceItem
                                    dense
                                    :balance="data && data.energy"
                                    :token="{symbol: 'VTHO', name: 'VeChain Thor', decimals: 18}"
                                />
                            </connex-continuous>

                            <template v-for="(token, index) in tokens">
                                <q-separator
                                    :key="`${index}-s`"
                                    inset="item"
                                />
                                <connex-continuous
                                    :connex="connex"
                                    :key="index"
                                    :query="() => tokenBalanceOf(connex, account, token)"
                                    v-slot="{data}"
                                >
                                    <TokenBalanceItem
                                        dense
                                        :token="token"
                                        :balance="data"
                                    />
                                </connex-continuous>
                            </template>
                        </q-list>
                    </AccountSelector>
                </ConnexObject>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import { QDialog } from 'quasar'
import Vue from 'vue'
import { tokenBalanceOf } from 'components/queries'
export default Vue.extend({
    props: {
        node: Object as () => M.Node,
        tokens: Array as () => M.TokenSpec[],
        wallets: Array as () => M.Wallet[],
        current: String
    },
    data() {
        return {
            signer: this.current || this.wallets[0].meta.addresses[0],
            currentAccountTab: ''
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        tokenBalanceOf,
        AccountTabChange(account: string) {
            this.currentAccountTab = account
        },
        signerChange(account: string) {
            this.$emit('ok', account)
            this.hide()
        }
    }
})
</script>
<style>
.selector-dialog > .q-dialog__inner {
    height: 70%;
}
</style>
