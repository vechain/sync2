<template>
    <q-expansion-item
        group="item"
        expand-icon-class="hidden"
    >
        <template v-slot:header>
            <q-item-section>
                <q-item-label>{{ title }}</q-item-label>
                <q-item-label
                    caption
                    class="ellipsis"
                    lines="1"
                >{{ entry.walletName || $t('common.unknown') }}</q-item-label>
                <q-item-label
                    caption
                >
                    <q-icon name="subdirectory_arrow_right" />
                    <address-label :addr="entry.signer" />
                </q-item-label>
                <q-item-label caption>
                    {{entry.time}}
                </q-item-label>
            </q-item-section>
            <q-item-section
                top
                side
            >
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
                <q-item-label>
                    <q-badge
                        v-if="networkBadgeText"
                        color="negative"
                        class="no-pointer-events text-bold"
                    >
                        {{networkBadgeText}}
                    </q-badge>
                </q-item-label>
            </q-item-section>
        </template>
        <template>
            <q-item v-if="entry.status === 'success?' || entry.status === 'sending'">
                <q-item-section />
                <q-item-section />
                <q-item-section side>
                    <q-item-label
                        caption
                        lines="1"
                    >
                        <span v-if="entry.status === 'sending'"> {{$t('activities.label_sending')}} </span>
                        <span v-if="entry.status === 'success?'">
                            <q-icon name="mdi-cube-outline" /> {{entry.confirming}}
                        </span>
                    </q-item-label>
                </q-item-section>
            </q-item>
            <q-item v-if="entry.comment">
                <q-item-section>
                    <q-item-label class="text-body2">
                        {{entry.comment}}
                    </q-item-label>
                </q-item-section>
                <q-item-section />
            </q-item>
            <q-item>
                <q-item-section />
                <q-item-section />
                <q-item-section side>
                    <div class="q-gutter-md">
                        <q-btn
                            rounded
                            flat
                            dense
                            v-if="entry.link"
                            @click="copy(entry.link)"
                            icon="mdi-link-variant"
                        />
                        <template v-if="entry.txId">
                            <q-btn
                                rounded
                                @click="copy(entry.txId)"
                                flat
                                dense
                                icon="mdi-content-copy"
                            />
                            <q-btn
                                rounded
                                @click="viewOnExplorer"
                                dense
                                flat
                                icon="mdi-file-search-outline"
                            />
                        </template>
                        <q-btn
                            v-else
                            flat
                            @click="viewContent"
                            rounded
                            dense
                            icon="mdi-message-text-outline"
                        />
                    </div>
                </q-item-section>
            </q-item>
        </template>
    </q-expansion-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { copyToClipboard, openURL } from 'quasar'
import { urls, genesises } from 'src/consts'
import AddressLabel from 'src/components/AddressLabel.vue'

export type Entry = {
    gid: string
    type: 'tx' | 'cert'
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
    components: { AddressLabel },
    props: {
        entry: Object as () => Entry
    },
    computed: {
        title(): string {
            return this.entry.type === 'tx' ? this.$t('common.transaction').toString() : this.$t('common.certificate').toString()
        },
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
            return this.$netDisplayName(this.entry.gid)
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
                message: this.entry.message,
                ok: false
            })
        }
    }
})
</script>
