import Vue from 'vue'
import { SignerGroup } from './models'
import { Transaction, secp256k1, Certificate, blake2b256 } from 'thor-devkit'
import { Vault } from 'src/core/vault'
import LedgerSignDialog from 'pages/Ledger/SignDialog.vue'

export default Vue.extend({
    props: {
        gid: String,
        req: Object as () => (M.CertRequest | M.TxRequest)
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
        async signTx(wallet: M.Wallet, signer: string, buildTx: () => Promise<Transaction>): Promise<Buffer> {
            if (wallet.meta.type === 'hd') {
                // acquire user master key
                const umk = await this.$authenticate()

                const tx = await buildTx()
                const vault = Vault.decode(wallet.vault)
                const node = vault.derive(wallet.meta.addresses.indexOf(signer))
                const sk = node.unlock(umk)
                return secp256k1.sign(tx.signingHash(), sk)
            } else if (wallet.meta.type === 'ledger') {
                const tx = await buildTx()
                return this.$dialog({
                    component: LedgerSignDialog,
                    arg: {
                        signer,
                        index: wallet.meta.addresses.indexOf(signer),
                        tx: tx.encode()
                    }
                })
            } else {
                throw new Error(`unsupported wallet type '${wallet.meta.type}'`)
            }
        },
        async signCert(wallet: M.Wallet, cert: Certificate): Promise<Buffer> {
            if (wallet.meta.type === 'hd') {
                // acquire user master key
                const umk = await this.$authenticate()

                const vault = Vault.decode(wallet.vault)
                const node = vault.derive(wallet.meta.addresses.indexOf(cert.signer))
                const sk = node.unlock(umk)
                return secp256k1.sign(blake2b256(Certificate.encode(cert)), sk)
            } else if (wallet.meta.type === 'ledger') {
                return this.$dialog({
                    component: LedgerSignDialog,
                    arg: {
                        signer: cert.signer,
                        index: wallet.meta.addresses.indexOf(cert.signer),
                        cert: Buffer.from(Certificate.encode(cert), 'utf8')
                    }
                })
            } else {
                throw new Error(`unsupported wallet type '${wallet.meta.type}'`)
            }
        }
    }
})
