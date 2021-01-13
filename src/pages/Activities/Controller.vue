<template>
    <div class="column fit no-wrap">
        <page-toolbar :title="$t('activities.title')" />
        <page-content class="col">
            <template v-if="entryList.length">
                <template v-for="(item, i) in entryList">
                    <q-separator :key="`s-${i}`" v-if="i !== 0" />
                    <Item
                        :entry="item"
                        :key="i"
                    />
                </template>
            </template>
            <template v-else>
                <div class="text-center q-px-xl column fit justify-center">
                    <div class="col-5">
                        <h6 class="text-h6 q-my-sm text-grey-8">{{$t('activities.msg_not_found')}}</h6>
                        <div class="text-body1 text-grey-6">{{$t('activities.msg_activities_desc')}}</div>
                    </div>
                </div>
            </template>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Item, { Entry } from './Item.vue'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'

export default Vue.extend({
    components: {
        Item,
        PageToolbar,
        PageContent
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
                    type: a.type,
                    time: `${Vue.filter('dateTime')(a.createdTime)}`,
                    signer: a.glob.signer,
                    walletName: this.walletNames[a.walletId] || '',
                    link: a.glob.link || '',
                    status: this.status(a),
                    comment: a.type === 'tx' ? a.glob.comment : this.certComment(a.glob.encoded)
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
            return `${confirms} / 12`
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
        certComment(encoded: string) {
            const cert: Connex.Vendor.CertMessage = JSON.parse(encoded)
            return cert.purpose === 'identification' ? this.$t('common.identification').toString() : this.$t('common.agreement').toString()
        },
        certMessage(encoded: string) {
            const cert: Connex.Vendor.CertMessage = JSON.parse(encoded)

            return cert.payload.content
        }
    }
})
</script>
