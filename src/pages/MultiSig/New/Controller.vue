<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('newMultiSig.title')" :gid="gid" />
        <page-content padding class="col" innerClass="fit column">
            <q-input bottom-slots filled :label="$t('newWallet.label_wallet_name')" v-model="name" :error="!!error"
                :error-message="error" no-error-icon />
            <div class="col column no-wrap flex-center">
                <img src="~assets/vechain-logo-tint.svg" style="min-height:0px;max-height:300px;max-width:100%">
            </div>
        </page-content>
        <page-action>
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
import PageToolbar from 'components/PageToolbar.vue'
import { Vault } from 'src/core/vault'
import PageContent from 'components/PageContent.vue'
import PageAction from 'components/PageAction.vue'
import AddressInputDialog from './AddressInputDialog.vue'

import { bytecode } from '../contract.json'
const MAX_DEPLOY_BLOCK_WAIT = 10

export default Vue.extend({
    components: { PageToolbar, PageContent, PageAction },
    props: {
        gid: String
    },
    data() {
        return {
            loading: true,
            name: '',
            error: '',
            importState: { address: '' }
        }
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor }
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
                } catch { }
                return
            }

            const msgItem: Connex.Vendor.TxMessage[0] = {
                to: null,
                value: 0,
                comment: this.$t('tx_deploy_title').toString(),
                data: bytecode
            }

            const wallets = await this.$svc.wallet.getByGid(this.gid)

            // if no suitable wallet, ask to create one
            if (wallets.length === 0) {
                try {
                    await this.$dialog({
                        title: this.$t('sign.title_ask_create_wallet').toString(),
                        message: this.$t('sign.message_ask_create_wallet').toString(),
                        ok: {
                            label: this.$t('common.ok'),
                            unelevated: true,
                            color: 'primary'
                        },
                        cancel: this.$t('common.cancel').toString()
                    })
                    this.$router.push({
                        name: 'new-wallet',
                        query: { defaultGid: this.gid }
                    })
                } catch { }
                return
            }

            // build transaction for deployment
            const result = await this.$signTx(this.gid, {
                message: [msgItem],
                options: {
                    comment: this.$t('tx_deploy_title').toString()
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

            // create a wallet
            if (contractAddress) {
                await this.addWallet(contractAddress)
            } else {
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
