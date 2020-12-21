<template>
    <div class="column fit">
        <page-toolbar :title="$t('activities.title')" />
        <div
            v-scrollDivider
            class="col overflow-auto"
        >
            <template v-if="entryList.length">
                <Item
                    :entry="item"
                    v-for="(item, i) in entryList"
                    :key="i"
                />
            </template>
            <template v-else>
                <div class="text-center q-px-xl column fit justify-center">
                    <div class="col-5">
                        <h6 class="text-h6 q-my-sm text-grey-8">{{$t('activities.msg_not_found')}}</h6>
                        <div class="text-body1 text-grey-6">{{$t('activities.msg_activities_desc')}}</div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Transaction } from 'thor-devkit'
import Item, { Entry } from './Item.vue'
export default Vue.extend({
    components: {
        Item
    },
    asyncComputed: {
        list: {
            get(): Promise<M.Activity[]> {
                return this.$svc.activity.page(100, 0)
            },
            default: []
        },
        walletNames: {
            async get(): Promise<{ [key: string]: string }> {
                const wallets = await this.$svc.wallet.all()
                return wallets.reduce<Record<number, string>>((prev, cur) => {
                    prev[cur.id] = cur.meta.name
                    return prev
                }, {})
            },
            default: {}
        }
    },
    computed: {
        entryList(): Entry[] {
            return this.list.map<Entry>((a: M.Activity) => {
                const temp: Entry = {
                    gid: a.gid,
                    time: `${a.type === 'tx' ? 'Tx' : 'Cert'} · ${Vue.filter('dateTime')(a.createdTime)}`,
                    signer: a.glob.signer,
                    walletName: this.walletNames[a.walletId] || '',
                    link: a.glob.link || '',
                    status: this.status(a),
                    comment: a.type === 'tx' ? this.describeClauses(a.glob.encoded) : this.certComment(a.glob.encoded)
                }
                if (a.type === 'tx') {
                    temp.txId = a.glob.id
                    temp.confirming = this.confirmText(a)
                } else {
                    temp.message = this.certMessage(a.glob.encoded)
                }

                return temp
            })
        }
    },
    methods: {
        confirmText(activity: M.Activity): string {
            const receipt = activity.type === 'tx' ? activity.glob.receipt : null
            if (!receipt) {
                return ''
            }
            const confirms = this.$svc.bc(activity.gid).thor.status.head.number - receipt.meta.blockNumber
            return `${this.$t('activities.label_confirming')} ${confirms} / 12`
        },
        status(a: M.Activity): 'reverted' | 'reverted?' | 'success' | 'success?' | 'sending' | 'expired' {
            if (a.type === 'cert') {
                return 'success'
            }

            const receipt = a.type === 'tx' ? a.glob.receipt : null

            if (a.status === 'completed') {
                return receipt ? receipt.reverted ? 'reverted' : 'success' : 'expired'
            } else {
                if (receipt) {
                    return receipt.reverted ? 'reverted?' : 'success?'
                } else {
                    return 'sending'
                }
            }
        },
        describeClauses(encoded: string) {
            const tx = Transaction.decode(Buffer.from(encoded.slice(2), 'hex'))
            const clauses = tx.body.clauses
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
        },
        certComment(encoded: string) {
            const cert: Connex.Vendor.CertMessage = JSON.parse(encoded)
            return cert.purpose === 'identification' ? 'Identification' : 'Agreement'
        },
        certMessage(encoded: string) {
            const cert: Connex.Vendor.CertMessage = JSON.parse(encoded)

            return cert.payload.content
        }
    }
})
</script>
