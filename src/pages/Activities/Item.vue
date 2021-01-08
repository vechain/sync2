<template>
    <q-list class="q-pt-md">
        <q-item class="q-py-none q-pr-lg">
            <q-item-section avatar>
                <address-avatar :addr="entry.signer" />
            </q-item-section>
            <q-item-section>
                <q-item-label
                    class="text-body1 monospace"
                    style="word-break: break-all;"
                >
                    <address-label :addr="entry.signer" />
                </q-item-label>
                <q-item-label
                    caption
                    class="ellipsis"
                    lines="1"
                >{{ entry.walletName || $t('common.unknown') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-item-label>
                    <q-icon
                        v-if="icon.name"
                        class="q-pa-none"
                        size="xs"
                        :name="icon.name"
                        :color="icon.color"
                    />
                    <q-badge
                        v-if="entry.status === 'reverted'"
                        color="warning"
                        text-color="white"
                        :label="$t('activities.label_reverted')"
                    />
                    <span
                        class="text-red"
                        v-if="entry.status === 'expired'"
                    > {{$t('activities.label_expired')}} </span>
                </q-item-label>
                <q-item-label
                    caption
                    lines="1"
                    v-if="entry.status === 'success?' || entry.status === 'sending'"
                >
                    <span v-if="entry.status === 'sending'"> {{$t('activities.label_sending')}} </span>
                    <span v-if="entry.status === 'success?'">
                        {{entry.confirming}}
                    </span>
                </q-item-label>
            </q-item-section>
        </q-item>
        <div class="q-px-md text-body2 q-pt-xs">
            {{entry.comment}}
        </div>
        <div class="q-px-md text-grey q-pt-xs text-caption row justify-between items-center">
            <span>
                {{entry.time}}
            </span>
            <q-btn
                round
                flat
                size="sm"
                icon="more_horiz"
            >
                <pop-sheets :sheets="sheets" />
            </q-btn>
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
import { urls, genesises } from 'src/consts'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import AddressLabel from 'src/components/AddressLabel.vue'

export type Entry = {
    gid: string,
    walletName: string
    signer: string
    comment: string
    time: string
    link: string
    status: 'reverted' | 'reverted?' | 'success' | 'success?' | 'sending' | 'expired'
    message?: string
    txId?: string
    confirming?: string
}

export default Vue.extend({
    components: { PopSheets, AddressAvatar, AddressLabel },
    props: {
        entry: Object as () => Entry
    },
    computed: {
        icon(): { name: string, color: string } {
            const result: { name: string, color: string } = { name: '', color: '' }
            switch (this.entry.status) {
                case 'success': {
                    result.name = 'mdi-check-circle-outline'
                    result.color = 'positive'
                    break
                }
                case 'success?': {
                    result.name = 'mdi-progress-check'
                    result.color = 'info'
                    break
                }
                case 'reverted?': {
                    result.name = 'mdi-progress-check'
                    result.color = 'warning'
                    break
                }
                case 'sending': {
                    result.name = 'mdi-progress-upload'
                    result.color = 'info'
                    break
                }
            }
            return result
        },
        txDetailUrl(): string {
            switch (genesises.which(this.entry.gid)) {
                case 'main':
                    return `${urls.explorerMain}transactions/`
                case 'test':
                    return `${urls.explorerTest}transactions/`
                default:
                    return ''
            }
        },
        networkBadgeText(): string {
            const net = Vue.filter('net')(this.entry.gid)
            if (net === 'main') {
                return ''
            }
            return net
        },
        sheets() {
            const sheets: Sheet[] = []
            if (this.entry.txId) {
                sheets.push({
                    label: this.$t('activities.action_view_on_explorer').toString(),
                    action: () => this.viewOnExplorer()
                }, {
                    label: this.$t('activities.action_copy_txId').toString(),
                    action: () => this.copy(this.entry.txId!)
                })
            } else {
                sheets.push({
                    label: this.$t('activities.action_view_signed_content').toString(),
                    action: () => this.viewContent()
                })
            }
            if (this.entry.link) {
                sheets.push({
                    label: this.$t('activities.action_copy_dapp_url').toString(),
                    action: () => this.copy(this.entry.link)
                })
            }
            return sheets
        }
    },
    methods: {
        copy(str: string) {
            copyToClipboard(str).then(() => {
                this.$q.notify(this.$t('common.copied'))
            }).catch(console.error)
        },
        viewOnExplorer() {
            openURL(`${this.txDetailUrl}${this.entry.txId}`)
        },
        viewContent() {
            this.$q.dialog({
                title: this.$t('activities.title_signed_content').toString(),
                message: this.entry.message
            })
        }
    }
})
</script>
