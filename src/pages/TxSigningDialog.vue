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
                                        <q-icon
                                            v-if="isSelectable"
                                            name="keyboard_arrow_right"
                                        />
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
    </q-dialog>
</template>
<script lang="ts">
import { QDialog } from 'quasar'
import Vue from 'vue'
import AccountSelectorDialog from 'components/AccountSelectorDialog.vue'

export default Vue.extend({
    props: {
        req: Object as () => M.TxRequest,
        gid: String
    },
    data() {
        return {
            signer: '',
            isSelectable: false
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
            if (!this.isSelectable) {
                return
            }
            this.$q.dialog({
                component: AccountSelectorDialog,
                node: this.node,
                wallets: this.wallets,
                tokens: this.tokens,
                current: this.signer
            }).onOk((account: string) => {
                this.signer = account
            })
        },
        onChecked() {
            console.log('checked')
        }
    }
})
</script>
