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
import PageToolbar from 'src/components/PageToolbar.vue'
import { genesises } from 'src/consts'
import { unique } from 'src/utils/array'
import { Vault } from 'src/core/vault'
import MnemonicInputDialog from './MnemonicInputDialog.vue'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'

const defaultGid = genesises.main.id

export default Vue.extend({
    components: { PageToolbar, PopSheets, PageContent, PageAction },
    data: () => {
        return {
            name: '',
            gid: defaultGid,
            error: '',
            importState: { words: '' }
        }
    },
    computed: {
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
        async newWallet(type: 'generate' | 'import', wordsCount = 12) {
            // reset error
            this.error = ''
            await this.$nextTick()

            // check name
            if (!this.name) {
                this.error = this.$t('common.required_field').toString()
                return
            }

            let words: string[] | undefined
            if (type === 'import') {
                // get user input words
                try {
                    words = await this.$dialog<string[]>({
                        component: MnemonicInputDialog,
                        state: this.importState
                    })
                } catch {
                    return
                }
            }
            // authentication
            try {
                const umk = await this.$authenticate()
                try {
                    // main process
                    await this.$loading(async () => {
                        const vault = Vault.createHD(
                            words || await Vault.generateMnemonic(wordsCount / 3 * 4),
                            umk)
                        const node0 = vault.derive(0)
                        await this.$svc.wallet.insert({
                            gid: this.gid,
                            vault: vault.encode(),
                            meta: {
                                name: this.name,
                                addresses: [node0.address],
                                backedUp: type === 'import'
                            }
                        })
                    })
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
