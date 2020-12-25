<template>
    <div class="fit column no-wrap">
        <page-toolbar :title="$t('newWallet.title')">
            <q-btn
                flat
                icon="more_horiz"
                dense
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
            >
                <template v-slot:hint>
                    <div class="text-right">
                        <q-badge
                            class="q-ml-sm"
                            outline
                            color="primary"
                            v-for="(h,i) in optionHints"
                            :key="i"
                        >{{h}}</q-badge>
                    </div>
                </template>
            </q-input>
            <div class="col column no-wrap flex-center">
                <img
                    src="~assets/new-wallet.svg"
                    style="min-height:0px;"
                >
                <p class="text-h6">{{$t('newWallet.title_desc')}}</p>
                <p class="text-body1">{{$t('newWallet.msg_desc')}}</p>
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
            />
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
const defaultWordsCount = 12

export default Vue.extend({
    components: { PageToolbar, PopSheets, PageContent, PageAction },
    data: () => {
        return {
            name: '',
            gid: defaultGid,
            wordsCount: defaultWordsCount,
            error: ''
        }
    },
    computed: {
        optionSheets() {
            return [
                ...this.gids
                    .filter(gid => gid !== this.gid)
                    .map<Sheet>(gid => {
                        return {
                            label: this.$netDisplayName(gid) + (gid === defaultGid ? ' (' + this.$t('common.default') + ')' : ''),
                            action: () => { this.gid = gid }
                        }
                    }),
                ...[12, 24]
                    .filter(n => n !== this.wordsCount)
                    .map<Sheet>(n => {
                        return {
                            label: `${n}` + ' ' + this.$t('newWallet.msg_mnemonic_words') + (n === defaultWordsCount ? ' (' + this.$t('common.default') + ')' : ''),
                            action: () => {
                                this.wordsCount = n
                            }
                        }
                    })
            ]
        },
        optionHints() {
            const hints = []
            if (this.gid !== defaultGid) {
                hints.push(this.$netDisplayName(this.gid))
            }
            if (this.wordsCount !== defaultWordsCount) {
                hints.push(`${this.wordsCount}` + ' ' + this.$t('newWallet.msg_mnemonic_words'))
            }
            return hints
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
        async newWallet(type: 'generate' | 'import') {
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
                const inputWords = await new Promise<string[] | null>(resolve => {
                    this.$q.dialog({
                        component: MnemonicInputDialog,
                        parent: this
                    }).onOk((words: string[]) => {
                        resolve(words)
                    }).onDismiss(() => {
                        resolve(null)
                    })
                })
                if (!inputWords) {
                    return
                }
                words = inputWords
            }
            // authentication
            let password: string
            try {
                password = await this.$authenticate()
            } catch {
                return
            }
            try {
                // main process
                await this.$loading(async () => {
                    const vault = await Vault.createHD(
                        words || await Vault.generateMnemonic(this.wordsCount / 3 * 4),
                        password)
                    const node0 = await vault.derive(0)
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
        }
    }
})
</script>
