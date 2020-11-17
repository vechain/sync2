<template>
    <q-list class="q-pt-md">
        <q-item class="q-py-none q-pr-lg">
            <q-item-section avatar>
                <AddressAvatar
                    class="q-mx-auto relative-position"
                    style="width: 40px; height: 40px; border-radius: 20px;"
                    :addr="item.glob.signer"
                >
                    <div class="absolute-bottom flex">
                        <q-badge
                            style="opacity: 0.9"
                            v-if="networkBadgeText"
                            class="text-capitalize q-mx-auto"
                            color="orange"
                            :label="networkBadgeText"
                        />
                    </div>
                </AddressAvatar>
            </q-item-section>
            <q-item-section>
                <q-item-label
                    class="text-body1 ellipsis-2-lines"
                    style="word-break: break-all;"
                >{{ walletNames[item.walletId] || '--' }}</q-item-label>
                <q-item-label
                    caption
                    lines="1"
                >{{ item.glob.signer | abbrev(8, 6) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-item-label>
                    <q-icon
                        v-if="icon.name"
                        class="q-pa-sm"
                        size="xs"
                        :name="icon.name"
                        :color="icon.color"
                    />
                    <q-badge
                        v-if="status === 'reverted'"
                        color="warning"
                        text-color="white"
                        label="Reverted"
                    />
                    <span
                        class="text-red"
                        v-if="status === 'expired'"
                    > Expired </span>
                </q-item-label>
                <q-item-label
                    caption
                    lines="1"
                    v-if="isConfirming || status === 'sending'"
                >
                    <span v-if="status === 'sending'"> sending </span>
                    <ConnexObject
                        v-else
                        :node="node"
                        v-slot="{connex}"
                    >
                        <span v-if="connex">
                            Confirming {{connex.thor.status.head.number - (tx.receipt && tx.receipt.meta.blockNumber)}} / 12
                        </span>
                    </ConnexObject>
                </q-item-label>
            </q-item-section>
        </q-item>
        <div
            class="q-px-md text-body2 q-pt-xs"
            :class="{'text-capitalize': type === 'cert'}"
        >
            {{infos.comment}}
        </div>
        <div
            v-if="infos.link"
            class="q-px-lg text-grey q-pt-xs text-caption"
        >
            <q-icon
                name="link"
                size="xs"
            />
            {{infos.refererText}}
        </div>
        <div class="q-px-md text-grey q-pt-xs text-caption row justify-between items-center">
            <span>
                {{infos.type === 'tx' ? 'Tx' : 'Cert'}} · {{item.createdTime | dateTime}}
            </span>
            <q-btn
                @click="onClick"
                round
                flat
                size="sm"
                icon="more_horiz"
            />
        </div>
        <q-separator
            spaced
            inset
        />
    </q-list>
</template>
<script lang="ts">
import Vue from 'vue'
import { copyToClipboard, openURL } from 'quasar'
import { urls, gids } from '../consts'

export default Vue.extend({
    props: {
        item: Object as () => M.Activity<'tx' | 'cert'>,
        walletNames: Object as () => { [key: number]: string }
    },
    computed: {
        node(): M.Node | undefined {
            return this.$state.config.node.list.find(item => {
                return item.gid === this.item.gid
            })
        },
        type(): 'tx' | 'cert' {
            return this.item.glob.type
        },
        tx(): M.Activity.Tx | undefined {
            if (this.item.glob.type === 'tx') {
                return this.item.glob
            }
            return undefined
        },
        networkBadgeText(): string {
            const net = Vue.filter('net')(this.item.gid)
            if (net === 'main') {
                return ''
            }
            return net
        },
        txDetailUrl(): string {
            if (this.item.gid === gids.main) {
                return `${urls.explorerMain}transactions/`
            } else if (this.item.gid === gids.test) {
                return `${urls.explorerTest}transactions/`
            } else {
                return ''
            }
        },
        comment(): string {
            if (this.type === 'tx') {
                return this.tx!.comment || this.describeClauses(this.tx!.message)
            } else {
                return (this.item.glob as M.Activity.Cert).message.purpose
            }
        },
        infos(): {
            comment: string,
            link: string,
            refererText: string,
            status: string, type: 'tx' | 'cert',
            message?: Connex.Vendor.CertMessage,
            txId?: string } {
            const link = (this.item.glob.referer && this.item.glob.referer.url) || ''
            return {
                comment: this.comment,
                link: link,
                refererText: link ? Vue.filter('urlHost')(link) : '',
                status: this.status,
                type: this.type,
                message: this.cert && this.cert.message,
                txId: this.tx && this.tx.id
            }
        },
        cert(): M.Activity.Cert | undefined {
            if (this.item.glob.type === 'cert') {
                return this.item.glob
            }
            return undefined
        },
        isConfirming(): boolean {
            return this.type === 'tx' ? !!(!this.tx!.finished && this.tx!.receipt) : false
        },
        status(): string {
            if (this.type === 'cert') {
                return 'completed'
            }

            if (this.tx!.finished) {
                return this.tx!.receipt ? this.tx!.receipt.reverted ? 'reverted' : 'completed' : 'expired'
            } else {
                if (this.tx!.receipt) {
                    return this.tx!.receipt.reverted ? 'reverted' : 'checking'
                } else {
                    const _st = this.$txer.status(this.tx!.id)
                    if (_st) {
                        return _st === 'error' ? 'error' : 'sending'
                    } else {
                        return 'retry'
                    }
                }
            }
        },
        icon(): { name: string, color: string } {
            const result: { name: string, color: string } = { name: '', color: '' }
            switch (this.status) {
                case 'completed': {
                    result.name = 'mdi-check-circle-outline'
                    result.color = 'positive'
                    break
                }
                case 'error': {
                    result.name = 'mdi-alert-circle-outline'
                    result.color = 'negative'
                    break
                }
                case 'checking': {
                    result.name = 'mdi-progress-check'
                    result.color = 'info'
                    break
                }
                case 'sending': {
                    result.name = 'mdi-progress-upload'
                    result.color = 'info'
                    break
                }
                case 'retry': {
                    result.name = 'mdi-restart'
                    result.color = 'info'
                    break
                }
            }
            return result
        }
    },
    methods: {
        copy(str: string) {
            copyToClipboard(str).then(() => {
                this.$q.notify('copied')
            }).catch(console.error)
        },
        viewOnExplorer() {
            openURL(`${this.txDetailUrl}${this.infos.txId}`)
        },
        viewContent() {
            this.$q.dialog({
                title: 'Signed Content',
                message: this.infos.message!.payload.content
            })
        },
        onClick() {
            let actions: {
                label: string,
                classes?: string | string[],
                onClick?: Function
            }[] = []

            if (this.infos.type === 'tx') {
                actions = [
                    {
                        label: 'View on explorer',
                        onClick: () => {
                            this.viewOnExplorer()
                        }
                    },
                    {
                        label: 'Copy TxID',
                        onClick: () => {
                            this.copy(this.infos.txId!)
                        }
                    }
                ]
            } else {
                actions = [
                    {
                        label: 'View signed content',
                        onClick: () => this.viewContent()
                    }
                ]
            }
            if (this.infos.link) {
                actions.push({
                    label: 'Copy dApp URL',
                    onClick: () => {
                        this.copy(this.infos.link)
                    }
                })
            }
            this.$actionSheets(actions)
        },
        describeClauses(clauses: Connex.VM.Clause[]) {
            if (clauses.length === 0) {
                return 'Empty'
            }
            if (clauses.length === 1) {
                if (!clauses[0].to) {
                    return 'Create a contract'
                }
                if (clauses[0].data === '0x') {
                    return 'Transfer VET'
                }
                return 'Make contract call'
            }

            return 'Perform a batch of clauses'
        }
    }
})
</script>
