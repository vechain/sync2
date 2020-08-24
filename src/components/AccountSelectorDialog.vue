<template>
    <q-item
        :clickable="isSelectable"
        @click="show"
    >
        <connex-continuous
            :connex="connex"
            :query="() => connex.thor.account(signer).get()"
            v-slot="{data}"
        >
            <q-item-section avatar>
                <AddressAvatar
                    class="q-mx-auto"
                    style="width: 65px; height: 35px; border-radius: 5px;"
                    :addr="signer"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label class="monospace text-body2">{{ signer | checksum | abbrev(8, 6) }}</q-item-label>
                <q-item-label
                    caption
                    lines="1"
                >
                    <template v-if="data">
                        {{data.balance | balance(18)}}
                    </template>
                    <q-spinner-dots
                        v-else
                        color="blue"
                    />
                    VET
                </q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon
                    v-if="isSelectable"
                    name="keyboard_arrow_right"
                />
            </q-item-section>
        </connex-continuous>

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
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-item>
</template>
<script lang="ts">
import { QDialog } from 'quasar'
import Vue from 'vue'
import { tokenBalanceOf } from 'components/queries'
export default Vue.extend({
    model: {
        prop: 'current',
        event: 'change'
    },
    props: {
        connex: Object as () => Connex,
        tokens: Array as () => M.TokenSpec[],
        wallets: Array as () => M.Wallet[],
        isSelectable: Boolean,
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
            this.$emit('change', account)
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
