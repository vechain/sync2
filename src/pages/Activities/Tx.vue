<template>
    <Item :info="info">
        <template v-slot:status>
            <q-item-label>
                <q-icon
                    v-if="icon.name"
                    class="q-pa-none"
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
                v-if="!isCompleted || status === 'sending'"
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
        </template>
    </Item>
</template>
<script lang="ts">
import Vue from 'vue'
import Item, { Info } from './Item.vue'
export default Vue.extend({
    components: {
        Item
    },
    props: {
        activity: Object as () => M.Activity<'tx'>,
        walletNames: Object as () => { [key: number]: string }
    },
    computed: {
        node(): M.Node | undefined {
            return this.$state.config.node.list.find(item => {
                return item.gid === this.activity.gid
            })
        },
        tx(): M.Activity.Tx {
            return this.activity.glob
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
        },
        isCompleted(): boolean {
            return this.activity.status === 'completed'
        },
        status(): string {
            if (this.isCompleted) {
                return this.tx.receipt ? this.tx.receipt.reverted ? 'reverted' : 'completed' : 'expired'
            } else {
                if (this.tx.receipt) {
                    return this.tx.receipt.reverted ? 'reverted' : 'checking'
                } else {
                    const _st = this.$txer.status(this.tx.id)
                    if (_st) {
                        return _st === 'error' ? 'error' : 'sending'
                    } else {
                        return 'retry'
                    }
                }
            }
        },
        info(): Info {
            const link = (this.activity.glob.referer && this.activity.glob.referer.url) || ''
            return {
                walletName: this.walletNames[this.activity.walletId],
                comment: this.tx.comment || this.describeClauses(this.tx.message),
                gid: this.activity.gid,
                link: link,
                signer: this.activity.glob.signer,
                refererText: link ? Vue.filter('urlHost')(link) : '',
                time: `Tx · ${Vue.filter('dateTime')(this.activity.createdTime)}`,
                txId: this.tx.id
            }
        }
    },
    methods: {
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
