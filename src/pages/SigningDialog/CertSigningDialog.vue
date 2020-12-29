<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column no-wrap">
            <page-toolbar
                title="Certificate"
                icon="close"
                :gid="gid"
                @action="hide()"
            />
            <page-content class="col q-pa-sm bg-grey-3">
                <div class="text-uppercase">{{req.message.purpose}}</div>
                <q-card
                    flat
                    class="bg-yellow-1"
                >
                    <div class="text-caption text-grey text-right q-px-xs">{{req.domain}}</div>
                    <q-card-section
                        class="serif"
                        style="min-height:300px;"
                    >
                        {{req.message.payload.content}}
                    </q-card-section>
                </q-card>
            </page-content>
            <page-content size="xs">
                <q-banner
                    v-if="!wallet"
                    dark
                    dense
                    rounded
                    class="bg-negative q-ma-sm"
                >Required address not owned</q-banner>
                <simple-signer-selector
                    :disable="!wallet"
                    v-model="signer"
                    :groups="signerGroups"
                />
            </page-content>
            <page-action class="q-mt-lg">
                <q-btn
                    v-if="wallet"
                    unelevated
                    color="primary"
                    label="Sign"
                    @click="onClickSign()"
                />
                <q-btn
                    v-else
                    outline
                    color="primary"
                    label="Close"
                    @click="hide()"
                />
            </page-action>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import PageToolbar from 'src/components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'
import SimpleSignerSelector, { SignerGroup } from './SimpleSignerSelector.vue'
import { Certificate, secp256k1, blake2b256 } from 'thor-devkit'
import { Vault } from 'core/vault'

export default Vue.extend({
    components: { PageToolbar, PageContent, PageAction, SimpleSignerSelector },
    props: {
        gid: String,
        req: Object as () => M.CertRequest
    },
    data() {
        return {
            signer: ''
        }
    },
    computed: {
        wallet(): M.Wallet | null {
            return (this.wallets || []).find(w => w.meta.addresses.includes(this.signer)) || null
        },
        signerGroups(): SignerGroup[] {
            const enforcedSigner = this.req.options.signer
            const wallets = this.wallets || []

            if (enforcedSigner) {
                const w = wallets.find(w => w.meta.addresses.includes(enforcedSigner))
                return [{
                    name: w ? w.meta.name : 'unknown wallet',
                    addresses: [enforcedSigner]
                }]
            }
            return wallets.map(w => {
                return {
                    name: w.meta.name,
                    addresses: w.meta.addresses
                }
            })
        }
    },
    asyncComputed: {
        wallets(): Promise<M.Wallet[] | null> {
            return this.$svc.wallet.getByGid(this.gid)
        }
    },
    watch: {
        signerGroups(groups: SignerGroup[]) {
            if (groups.length > 0 && !groups.find(g => g.addresses.includes(this.signer))) {
                this.signer = groups[0].addresses[0]
            }
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },

        ok(result: M.CertResponse) {
            this.$emit('ok', result)
            this.hide()
        },
        async onClickSign() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }

            const password = await this.$authenticate()

            const req = this.req
            const annex = {
                signer: this.signer,
                timestamp: Math.round(Date.now() / 1000),
                domain: req.domain
            }
            const unsigned = Certificate.encode({
                ...req.message,
                ...annex
            })

            const signature = await this.$loading(async () => {
                const vault = await Vault.decode(wallet.vault)
                const node = await vault.derive(wallet.meta.addresses.indexOf(this.signer))
                const pk = await node.unlock(password)
                return '0x' + secp256k1.sign(blake2b256(unsigned), pk).toString('hex')
            })

            const id = '0x' + blake2b256(Certificate.encode({
                ...req.message,
                ...annex,
                signature
            })).toString('hex')

            this.$svc.activity.add({
                gid: this.gid,
                walletId: wallet.id,
                createdTime: Date.now(),
                status: 'completed',
                type: 'cert',
                glob: {
                    id: id,
                    encoded: JSON.stringify(req.message),
                    signer: this.signer,
                    link: this.req.options.link || '',
                    origin: this.req.origin || ''
                }
            })
            this.ok({
                annex,
                signature
            })
        }
    }
})
</script>
