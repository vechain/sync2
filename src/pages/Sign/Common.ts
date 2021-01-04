import Vue from 'vue'
import { SignerGroup } from './models'

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
    }
})
