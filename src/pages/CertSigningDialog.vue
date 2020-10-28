<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="fit column no-wrap">
            <div class="column">
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
            </div>
            <q-card-section
                v-scrollDivider.both
                class="overflow-auto column no-wrap"
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
                class="column bg-grey-2 shadow-up-1 q-mt-auto"
                style="z-index: 2"
            >
                <template v-if="!signing">
                    <div
                        v-if="(isEnforced && !hasTheSigner) || !wallets.length"
                        class="column items-center q-mx-auto q-gutter-y-md"
                    >
                        <q-icon
                            name="error_outline"
                            class="text-red"
                            size="xl"
                        />
                        <span class="text-body1">Account doesn't exist</span>
                        <q-btn
                            label="Close"
                            class="q-px-lg"
                            color="primary"
                            @click="hide"
                        />
                    </div>
                    <ConnexObject
                        v-else
                        v-slot="{connex}"
                        :node="node"
                    >
                        <q-list class="full-width">
                            <AccountSelector
                                v-model="signer"
                                :wallets="wallets"
                                :connex="connex"
                                v-slot="{address}"
                                :isSelectable="!isEnforced"
                            >
                                <BalanceList
                                    :connex="connex"
                                    :address="address"
                                />
                            </AccountSelector>
                            <q-item class="q-my-lg">
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
                </template>
                <template v-else>
                    <div class="text-center q-px-xl">
                        <div class="q-my-xl">
                            <q-spinner-oval size="3.5em" />
                            <div class="text-body1 q-mt-sm">Signing approved content, one sec</div>
                        </div>
                    </div>
                </template>
            </q-card-actions>
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
        gid: String,
        referer: Object as () => M.Referer
    },
    data() {
        return {
            signer: '',
            signed: false,
            signing: false
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
        isEnforced(): boolean {
            return !!(this.req.options && this.req.options.signer)
        },
        hasTheSigner(): boolean {
            return this.isEnforced && this.addresses.includes(this.req.options!.signer!)
        },
        addresses(): string[] {
            let addrList: string[] = []
            this.wallets.forEach(wallet => {
                addrList = [...addrList, ...wallet.meta.addresses]
            })
            return addrList
        },
        wallet(): M.Wallet | null {
            return this.wallets.find((w: M.Wallet) => {
                return w.meta.addresses.includes(this.signer)
            }) || null
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        initData() {
            if (this.isEnforced) {
                this.signer = this.hasTheSigner
                    ? this.req.options!.signer!
                    : ''
            } else {
                this.signer = this.wallets[0].meta.addresses[0]
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
            try {
                this.signing = true
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
                    const id = '0x' + blake2b256(Certificate.encode({
                        ...this.req.message,
                        ...annex,
                        signature: signature
                    })).toString('hex')

                    const cert: M.Activity.Cert = {
                        id: id,
                        message: this.req.message,
                        finished: true,
                        signer: this.signer,
                        type: 'cert',
                        referer: this.referer || {},
                        timestamp: connex.thor.status.head.timestamp,
                        signature: signature
                    }
                    this.$storage.activities.insert({
                        gid: this.gid,
                        walletId: this.wallet.id,
                        createdTime: Date.now(),
                        glob: JSON.stringify(cert)
                    })
                    this.ok({
                        annex,
                        signature
                    })
                }
            } catch (error) {
                this.signed = false
                console.log(error)
            } finally {
                this.signing = false
                this.hide()
            }
        }
    }
})
</script>
