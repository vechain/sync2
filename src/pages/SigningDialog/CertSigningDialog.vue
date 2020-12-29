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
                    v-if="signerError"
                    dark
                    dense
                    rounded
                    class="bg-negative q-ma-sm"
                >{{signerError}}</q-banner>
                <simple-signer-selector
                    v-if="wallet"
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
                    name: w ? w.meta.name : '',
                    addresses: [enforcedSigner]
                }]
            }
            return wallets.map(w => {
                return {
                    name: w.meta.name,
                    addresses: w.meta.addresses
                }
            })
        },
        signerError(): string {
            if (this.wallet) {
                return ''
            }
            return this.signerGroups.length > 0 ? 'required address not owned' : 'no wallet available'
        }
    },
    asyncComputed: {
        wallets(): Promise<M.Wallet[] | null> {
            return this.$svc.wallet.getByGid(this.gid)
        }
    },
    watch: {
        // select the first address if not selected
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

            const req = this.req
            // build the cert (unsigned)
            const cert: Certificate = {
                ...req.message,
                // annex part
                signer: this.signer,
                timestamp: Math.round(Date.now() / 1000),
                domain: req.domain
            }

            // acquire user password
            const password = await this.$authenticate()

            // sign the cert
            const signature = await this.$loading(async () => {
                const vault = await Vault.decode(wallet.vault)
                const node = await vault.derive(wallet.meta.addresses.indexOf(cert.signer))
                const sk = await node.unlock(password)
                const unsigned = Certificate.encode(cert)
                return '0x' + secp256k1.sign(blake2b256(unsigned), sk).toString('hex')
            })

            // here cert become signed
            cert.signature = signature
            const encoded = Certificate.encode(cert)

            this.$svc.activity.add({
                gid: this.gid,
                walletId: wallet.id,
                createdTime: Date.now(),
                status: 'completed',
                type: 'cert',
                glob: {
                    id: '0x' + blake2b256(encoded).toString('hex'),
                    encoded,
                    signer: cert.signer,
                    link: req.options.link || '',
                    origin: req.origin || ''
                }
            })
            this.ok({
                annex: {
                    domain: cert.domain,
                    signer: cert.signer,
                    timestamp: cert.timestamp
                },
                signature
            })
        }
    }
})
</script>
