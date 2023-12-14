<template>
    <div class="fit column no-wrap">
        <page-toolbar
            :title="$t('newWallet.title')"
            :gid="gid"
        >
            <q-btn
                flat
                icon="more_horiz"
                round
            >
                <pop-sheets :sheets="optionSheets" />
            </q-btn>
        </page-toolbar>
        <page-content
            padding
            class="col"
            innerClass="fit column"
        >
            <q-input
                bottom-slots
                filled
                :label="$t('newWallet.label_wallet_name')"
                v-model="name"
                :error="!!error"
                :error-message="error"
                no-error-icon
            />
            <div class="col column no-wrap flex-center">
                <img
                    src="~assets/vechain-logo-tint.svg"
                    style="min-height:0px;max-height:300px;max-width:100%"
                >
            </div>
            <div
                v-if="isSupport"
                class="row flex-center"
            >
                <svg-ledger />
                {{$t('newWallet.label_ledger_user')}}
                <q-btn
                    color="primary"
                    flat
                    @click="newWallet('linkLedger')"
                >{{$t('newWallet.action_ledger_link')}}</q-btn>
            </div>
        </page-content>
        <page-action>
            <q-btn
                color="primary"
                outline
                :label="$t('newWallet.action_import')"
                @click="newWallet('import')"
            />
            <q-btn
                color="primary"
                unelevated
                :label="$t('newWallet.action_generate')"
                @click="newWallet('generate')"
            >
                <pop-sheets
                    :sheets="generationOptionSheets"
                    context-menu
                />
            </q-btn>
        </page-action>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageToolbar from 'components/PageToolbar.vue'
import { genesises } from 'src/consts'
import { unique } from 'src/utils/array'
import { Vault } from 'src/core/vault'
import MnemonicInputDialog from './MnemonicInputDialog.vue'
import LedgerLinkDialog from 'pages/Ledger/LinkDialog.vue'
import PopSheets, { Sheet } from 'components/PopSheets.vue'
import PageContent from 'components/PageContent.vue'
import PageAction from 'components/PageAction.vue'
import { Account } from '@vechain/hw-app-vet'
import * as Ledger from 'src/utils/ledger'
import SvgLedger from 'components/SvgLedger.vue'
import { BackupDialog } from '../Backup'

const defaultGid = genesises.main.id

export default Vue.extend({
    components: { PageToolbar, PopSheets, PageContent, PageAction, SvgLedger },
    props: {
        defaultGid: String
    },
    data() {
        return {
            name: '',
            gid: this.defaultGid || defaultGid,
            error: '',
            importState: { words: '', path: '' }
        }
    },
    computed: {
        isSupport(): boolean {
            return Ledger.supported
        },
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
                    action: () => this.newWallet('generate', n)
                }
            })]
        }
    },
    asyncComputed: {
        suggestedName: {
            async get(): Promise<string> {
                const wallets = await this.$svc.wallet.all()
                const baseName = this.$t('newWallet.title')
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
        async linkLedger() {
            try {
                const account = await this.$dialog<Account>({
                    component: LedgerLinkDialog
                })
                try {
                    await this.$loading(async () => {
                        const vault = Vault.createUSB(Buffer.from(account.publicKey, 'hex'), Buffer.from(account.chainCode!, 'hex'))
                        const node0 = vault.derive(0)
                        await this.$svc.wallet.insert({
                            gid: this.gid,
                            vault: vault.encode(),
                            meta: {
                                name: this.name,
                                type: 'ledger',
                                addresses: [node0.address],
                                backedUp: true
                            }
                        })
                        this.$backOrHome()
                        this.$q.notify(this.$t('common.wallet_created'))
                    })
                } catch (err) {
                    this.error = err.message
                }
            } catch { }
        },
        async newWallet(type: 'generate' | 'import' | 'linkLedger', wordsCount = 12) {
            // reset error
            this.error = ''
            await this.$nextTick()

            // check name
            if (!this.name) {
                this.error = this.$t('common.required_field').toString()
                return
            }

            if (type === 'linkLedger') {
                try {
                    await this.linkLedger()
                } catch { }
                return
            }

            let words: string[] | undefined
            let path: string
            if (type === 'import') {
                // get user input words and path
                try {
                    [words, path] = await this.$dialog<[string[], string]>({
                        component: MnemonicInputDialog,
                        state: this.importState
                    })
                } catch {
                    return
                }
            }
            try {
                const umk = await this.$authenticate()
                try {
                    // main process
                    let walletID = -1
                    let meta: M.Wallet.Meta | null = null
                    await this.$loading(async () => {
                        words = words || await Vault.generateMnemonic(wordsCount / 3 * 4)
                        const vault = Vault.createHD(
                            words,
                            umk,
                            path)
                        const node0 = vault.derive(0)
                        meta = {
                            name: this.name,
                            type: 'hd',
                            addresses: [node0.address],
                            backedUp: type === 'import'
                        }
                        walletID = await this.$svc.wallet.insert({
                            gid: this.gid,
                            vault: vault.encode(),
                            meta: meta
                        })
                    })
                    // backup in lite mode
                    if (process.env.MODE === 'spa' || process.env.MODE === 'pwa') {
                        if (type === 'generate') {
                            try {
                                await this.$dialog({
                                    component: BackupDialog,
                                    walletId: walletID,
                                    meta: meta,
                                    words: words
                                })
                            } catch { }
                        }
                    }
                    this.$backOrHome()
                    this.$q.notify(this.$t('common.wallet_created'))
                } catch (err) {
                    this.error = err.message
                }
            } catch { }
        }
    }
})
</script>
