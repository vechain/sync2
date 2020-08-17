<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <div class="fit">
                <q-toolbar>
                    <q-toolbar-title class="absolute-center">
                        Sign
                    </q-toolbar-title>
                    <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        @click="hide"
                    />
                </q-toolbar>
                <!-- clause list -->
                <q-card-section
                    v-scrollDivider
                    class="overflow-auto"
                    style="height: calc(100% - 202px)"
                >
                    <ClauseCard
                        v-for="(msg, i) in req.message"
                        :key="i"
                        :tokens="tokens"
                        :msg="msg"
                    >
                        {{ `Clause #${i+1}`}}
                    </ClauseCard>
                </q-card-section>
                <!-- signer infos -->
                <q-card-actions
                    class="absolute-bottom bg-grey-2 shadow-up-1"
                    style="z-index: 2"
                >
                    <ConnexObject
                        v-slot="{connex}"
                        :node="node"
                    >
                        <q-list class="full-width">
                            <!-- TODO -->
                            <q-item dense>
                                <q-item-section>
                                    <q-item-label class="text-body2">
                                        Est Fee 61.00 VTHO
                                    </q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn size="xs">Speed</q-btn>
                                </q-item-section>
                            </q-item>
                            <q-item
                                :clickable="isSelectable"
                                @click="showAccounts"
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
                                        <q-item-label class="monospace text-body2">{{ signer | checksum | abbrev(8) }}</q-item-label>
                                        <q-item-label
                                            caption
                                            lines="1"
                                        > {{data && data.balance | balance(18)}} VET</q-item-label>
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-icon name="keyboard_arrow_right" />
                                    </q-item-section>
                                </connex-continuous>
                            </q-item>
                            <q-item>
                                <SlideBtn
                                    @checked="onChecked"
                                    label="Slide to Sign"
                                    style="width: 70%"
                                    class="absolute-center"
                                />
                            </q-item>
                        </q-list>
                    </ConnexObject>
                </q-card-actions>
            </div>
        </q-card>

        <!-- select signer -->
        <q-dialog
            content-class="selector-dialog"
            v-model="isSelecting"
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
    </q-dialog>
</template>
<script lang="ts">
import { QDialog } from 'quasar'
import { tokenBalanceOf } from 'components/queries'
import Vue from 'vue'

export default Vue.extend({
    props: {
        req: Object as () => M.TxRequest,
        gid: String
    },
    data() {
        return {
            signer: '',
            isSelectable: false,
            isSelecting: false,
            currentAccountTab: ''
        }
    },
    computed: {
        node() {
            return this.$state.config.node.list.find(item => {
                return item.gid === this.gid
            })
        },
        tokens(): M.TokenSpec[] {
            return this.$state.config.token.specs(this.gid, true)
        },
        wallets() {
            return this.$state.wallet.list.filter(item => {
                return item.gid === this.gid
            })
        }
    },
    created() {
        this.initData()
    },
    methods: {
        tokenBalanceOf,
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: M.TxResponse) {
            this.$emit('ok', result)
            this.hide()
        },
        initData() {
            if (!this.hasTheSigner()) {
                // TODO return
            }
            this.signer = (this.req.options && this.req.options.signer)
                ? this.req.options.signer
                : this.wallets[0].meta.addresses[0]
            this.isSelectable = !(this.req.options && this.req.options.signer)
        },
        hasTheSigner(): boolean {
            if (this.req.options && this.req.options.signer) {
                let addrList: string[] = []
                this.wallets.forEach(wallet => {
                    addrList = [...addrList, ...wallet.meta.addresses]
                })

                return addrList.includes(this.req.options.signer)
            } else {
                return true
            }
        },
        showAccounts() {
            this.isSelecting = true
        },
        onChecked() {
            console.log('checked')
        },
        AccountTabChange(account: string) {
            this.currentAccountTab = account
        }
    }
})
</script>
<style>
.selector-dialog > .q-dialog__inner {
    height: 70%;
}
</style>
