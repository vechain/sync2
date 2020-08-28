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
                <q-card-section
                    v-scrollDivider
                    class="overflow-auto"
                    style="height: calc(100% - 165px)"
                >
                    <q-card
                        bordered
                        flat
                    >
                        <q-card-section>
                            <div class="text-h6 text-capitalize">{{req.message.purpose}}</div>
                            <div class="text-grey text-body2">
                                {{req.message.payload.content}}
                            </div>
                        </q-card-section>
                    </q-card>
                </q-card-section>
                <q-card-actions
                    class="absolute-bottom bg-grey-2 shadow-up-1"
                    style="z-index: 2"
                >
                    <ConnexObject
                        v-slot="{connex}"
                        :node="node"
                    >
                        <q-list class="full-width">
                            <AccountSelector
                                v-model="signer"
                                :wallets="wallets"
                                :connex="connex"
                                v-slot="{address}"
                                :isSelectable="true"
                            >
                                <BalanceList
                                    :connex="connex"
                                    :address="address"
                                />
                            </AccountSelector>
                            <q-item>
                                <SlideBtn
                                    v-model="signed"
                                    @checked="sign(connex)"
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
import { Vault } from 'core/vault'
import { Certificate } from 'thor-devkit/dist/certificate'
import { secp256k1, blake2b256 } from 'thor-devkit/dist/cry'

export default Vue.extend({
    props: {
        req: Object as () => M.CertRequest,
        gid: String
    },
    data() {
        return {
            signer: '',
            isSelectable: false,
            signed: false
        }
    },
    computed: {
        node(): M.Node | null {
            return this.$state.config.node.list.find(n => {
                return n.gid === this.gid
            }) || null
        },
        wallets(): M.Wallet[] {
            return this.$state.wallet.list.filter(w => {
                return w.gid === this.gid
            })
        },
        wallet(): M.Wallet | null {
            return this.wallets.find((w: M.Wallet) => {
                return w.meta.addresses.includes(this.signer)
            }) || null
        }
    },
    created() {
        this.initData()
    },
    methods: {
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
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: M.CertResponse) {
            this.$emit('ok', result)
            this.hide()
        },
        async sign(connex: Connex) {
            // TODO recode, next step
            try {
                const pin = await this.$authenticate(pin => Promise.resolve(pin))
                if (this.wallet) {
                    const vault = await Vault.decode(this.wallet.vault)
                    const node = await vault.derive(this.wallet.meta.addresses.indexOf(this.signer))
                    const privateKey = await node.unlock(pin)
                    const annex = {
                        signer: this.signer,
                        timestamp: connex.thor.status.head.timestamp,
                        domain: this.req.domain
                    }
                    const unsigned = Certificate.encode({
                        ...this.req.message,
                        ...annex
                    })
                    const signature = '0x' + secp256k1.sign(blake2b256(unsigned), privateKey).toString('hex')
                    console.log(annex, signature)
                    this.ok({
                        annex,
                        signature
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
})
</script>
