<template>
    <div class="fit column">
        <page-toolbar title="New Wallet">
            <q-btn
                flat
                icon="more_horiz"
                dense
                round
                @click="onClickOptions()"
            />
        </page-toolbar>
        <div class="narrow-page col self-center column no-wrap q-gutter-y-md q-pa-md">
            <q-input
                class="q-mx-md"
                bottom-slots
                filled
                label="Wallet Name"
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
                            v-for="(h,i) in optionsHints"
                            :key="i"
                        >{{h}}</q-badge>
                    </div>
                </template>
            </q-input>
            <div class="col column flex-center overflow-scroll">
                <div>xx</div>
            </div>
            <q-btn
                class="self-center w50"
                color="primary"
                unelevated
                label="Generate"
                @click="newWallet('generate')"
            />
            <q-btn
                class="self-center w50"
                color="primary"
                flat
                label="Import backup"
                @click="newWallet('import')"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageToolbar from 'src/components/PageToolbar.vue'
import { genesises } from 'src/consts'
import { unique } from 'src/utils/array'
import { Vault } from 'src/core/vault'
import MnemonicInputDialog from './MnemonicInputDialog.vue'

const defaultGid = genesises.main.id
const defaultWordsCount = 12

export default Vue.extend({
    components: { PageToolbar },
    data: () => {
        return {
            name: '',
            gid: defaultGid,
            wordsCount: defaultWordsCount,
            error: ''
        }
    },
    computed: {
        optionsHints() {
            const hints = []
            if (this.gid !== defaultGid) {
                hints.push(this.$netDisplayName(this.gid))
            }
            if (this.wordsCount !== defaultWordsCount) {
                hints.push(`${this.wordsCount} words mnemonic`)
            }
            return hints
        }
    },
    asyncComputed: {
        suggestedName: {
            async get(): Promise<string> {
                const wallets = await this.$svc.wallet.all()
                const baseName = 'New Wallet'
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
        onClickOptions() {
            type Action = Parameters<Vue['$actionSheets']>[0][0]
            const actions: Action[] = []
            actions.push(...this.gids
                .filter(gid => gid !== this.gid)
                .map<Action>(gid => {
                    return {
                        label: this.$netDisplayName(gid) + (gid === defaultGid ? ' (default)' : ''),
                        onClick: () => {
                            this.gid = gid
                        }
                    }
                }))
            actions.push({ label: '-' })
            actions.push(...[12, 24]
                .filter(n => n !== this.wordsCount)
                .map(n => {
                    return {
                        label: `${n} words mnemonic` + (n === defaultWordsCount ? ' (default)' : ''),
                        onClick: () => {
                            this.wordsCount = n
                        }
                    }
                }))
            this.$actionSheets(actions)
        },
        async newWallet(type: 'generate' | 'import') {
            // check name
            if (!this.name) {
                this.error = 'Please give a name'
                return
            }
            // reset error
            this.error = ''

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
                    const meta: M.Wallet.Meta = {
                        name: this.name,
                        addresses: [node0.address],
                        backedUp: false
                    }
                    await this.$svc.wallet.insert({
                        gid: this.gid,
                        vault: vault.encode(),
                        meta
                    })
                })
                this.$backOrHome()
                this.$q.notify('Wallet created successfully')
            } catch (err) {
                this.error = err.message
            }
        }
    }
})
</script>
