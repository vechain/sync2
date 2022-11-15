<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('newMultiSig.title')" :gid="gid">
            <q-btn flat icon="more_horiz" round>
                <pop-sheets :sheets="optionSheets" />
            </q-btn>
        </page-toolbar>
        <!-- loading -->
        <page-content v-if="loading" class="q-my-auto text-center">
            <p>
                <q-spinner-dots class="text-h2" />
            </p>
            <p>{{ $t('newMultiSig.msg_deploying') }}</p>
        </page-content>
        <page-content padding class="col" innerClass="fit column" v-if="!loading">
            <q-input bottom-slots filled :label="$t('newWallet.label_wallet_name')" v-model="name" :error="!!error"
                :error-message="error" no-error-icon />
            <div>
                <p>{{ $t('newMultiSig.msg_intro') }}</p>
            </div>
            <div class="col column no-wrap flex-center">
                <img src="~assets/vechain-logo-tint.svg" style="min-height:0px;max-height:300px;max-width:100%">
            </div>
        </page-content>
        <page-action v-if="!loading">
            <q-btn color="primary" outline :label="$t('newMultiSig.action_import')" @click="newWallet('import')"
                :disable="loading">
                <q-spinner-dots v-if="loading" />
            </q-btn>
            <q-btn color="primary" unelevated :label="$t('newMultiSig.action_deploy')" @click="newWallet('generate')"
                :disable="loading">
                <q-spinner-dots v-if="loading" />
            </q-btn>
        </page-action>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { unique } from 'src/utils/array'
import PageToolbar from 'components/PageToolbar.vue'
import { Vault } from 'src/core/vault'
import PageContent from 'components/PageContent.vue'
import PageAction from 'components/PageAction.vue'
import PopSheets, { Sheet } from 'components/PopSheets.vue'
import AddressInputDialog from './AddressInputDialog.vue'
import { bytecode as MultiSigBytecode } from '../contract.json'

const MAX_DEPLOY_BLOCK_WAIT = 12

export default Vue.extend({
    components: { PageToolbar, PopSheets, PageContent, PageAction },
    props: {
        defaultGid: String
    },
    data() {
        return {
            loading: false,
            gid: this.defaultGid,
            name: '',
            error: '',
            importState: { address: '' }
        }
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor },
        optionSheets(): Sheet[] {
            return this.gids.map<Sheet>(gid => {
                return {
                    label: this.$netDisplayName(gid) + (gid === this.gid ? ' ✓' : ''),
                    action: () => { this.gid = gid }
                }
            })
        },
        generationOptionSheets(): Sheet[] {
            return [{
                label: this.$t('newWallet.mnemonic_words_count').toString(),
                header: true
            },
            ...[12, 24].map<Sheet>(n => {
                return {
                    label: `${n}`,
                    action: () => this.newWallet('generate')
                }
            })]
        }
    },
    asyncComputed: {
        suggestedName: {
            async get(): Promise<string> {
                const wallets = await this.$svc.wallet.all()
                const baseName = this.$t('newMultiSig.baseName')
                for (let i = 1; ; i++) {
                    const name = `${baseName}${i}`
                    if (!wallets.find(w => w.meta.name === name)) {
                        return name
                    }
                }
            },
            default: ''
        },
        gids: {
            async get(): Promise<string[]> {
                const nodes = await this.$svc.config.node.all()
                return unique(nodes.map(n => n.genesis.id))
            },
            default: []
        }
    },
    watch: {
        suggestedName(newVal: string) {
            this.name = newVal
        },
        name() {
            this.error = ''
        }
    },
    methods: {
        linkMultiSig() {
            this.$router.replace({ name: 'new-multisig' })
        },
        async newWallet(type: 'generate' | 'import') {
            let contractAddress

            // reset error
            this.error = ''
            await this.$nextTick()

            // check name
            if (!this.name) {
                this.error = this.$t('common.required_field').toString()
                return
            }

            this.loading = true
            if (type === 'import') {
                try {
                    contractAddress = await this.$dialog<string>({
                        component: AddressInputDialog,
                        state: this.importState
                    })
                    if (contractAddress) {
                        await this.addWallet(contractAddress)
                    }
                } catch {
                }
                this.loading = false
                return
            }

            // build transaction for deployment
            const msgItem: Connex.Vendor.TxMessage[0] = {
                to: null,
                value: 0,
                comment: this.$t('newMultiSig.tx_deploy_title').toString(),
                data: MultiSigBytecode
            }

            try {
                const result = await this.$signTx(this.gid, {
                    message: [msgItem],
                    options: {
                        comment: this.$t('newMultiSig.tx_deploy_title').toString()
                    }
                })

                // wait until contract is deployed
                let maxBlockWait = MAX_DEPLOY_BLOCK_WAIT
                do {
                    const tx = this.thor.transaction(result.txid)
                    const receipt = await tx.getReceipt()
                    if (receipt?.reverted) {
                        break
                    } else if (receipt) {
                        contractAddress = receipt?.outputs[0]?.contractAddress
                        break
                    }
                } while (await this.thor.ticker().next() && --maxBlockWait)

                if (!contractAddress) {
                    throw new Error('could not find deployment address')
                }

                // create a wallet
                await this.addWallet(contractAddress)
            } catch (err) {
                this.loading = false
                this.error = this.$t('newMultiSig.msg_deployment_failed').toString()
            }
        },
        async addWallet(contractAddress: string) {
            const umk = await this.$authenticate()
            const vault = Vault.createHD(await Vault.generateMnemonic(12 / 3 * 4), umk)
            await this.$svc.wallet.insert({
                gid: this.gid,
                vault: vault.encode(),
                meta: {
                    name: this.name,
                    type: 'multisig',
                    addresses: [contractAddress],
                    backedUp: true
                }
            })

            this.loading = false
            this.$backOrHome()
            this.$q.notify(this.$t('common.wallet_created'))
        }
    }
})
</script>
