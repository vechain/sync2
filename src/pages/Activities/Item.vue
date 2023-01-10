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
                    lines="1"
                >{{ entry.walletName || $t('common.unknown') }}</q-item-label>
                <q-item-label caption>
                    ┗
                    <address-label :addr="entry.signer" />
                </q-item-label>
                <q-item-label caption>
                    {{formatDate(entry.time)}}
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
            <q-item v-if="['success?', 'reverted?', 'sending'].includes(entry.status)">
                <q-item-section />
                <q-item-section />
                <q-item-section side>
                    <q-item-label
                        caption
                        lines="1"
                    >
                        <span v-if="entry.status === 'sending'"> {{$t('activities.label_sending')}} </span>
                        <span v-if="['success?', 'reverted?'].includes(entry.status)">
                            <q-icon name="hourglass_top" /> {{entry.confirming}}
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
                            @click="openLink(entry.link)"
                            icon="link"
                        />
                        <template v-if="entry.type === 'tx' && entry.id">
                            <q-btn
                                rounded
                                @click="entry.id && copy(entry.id)"
                                flat
                                dense
                                icon="content_copy"
                            />
                            <q-btn
                                rounded
                                @click="viewOnExplorer"
                                dense
                                flat
                                icon="search"
                            />
                        </template>
                        <q-btn
                            v-else
                            flat
                            @click="viewContent"
                            rounded
                            dense
                            icon="message"
                        />
                    </div>
                </q-item-section>
            </q-item>
        </template>
    </q-expansion-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { openURL } from 'src/utils/open-url'
import { urls, genesises } from 'src/consts'
import AddressLabel from 'src/components/AddressLabel.vue'
import { formatDate } from 'src/utils/format'
import { copyText } from 'src/utils/clipboard'

export type Entry = {
    gid: string
    type: 'tx' | 'cert'
    walletName: string
    signer: string
    comment: string
    time: number
    link: string
    status: 'reverted' | 'reverted?' | 'success' | 'success?' | 'sending' | 'expired'
    message?: string
    id: string
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
                    result.name = 'done_all'
                    result.color = 'positive'
                    break
                }
                case 'success?': {
                    result.name = 'done'
                    result.color = 'info'
                    break
                }
                case 'reverted?': {
                    result.name = 'published_with_changes'
                    result.color = 'warning'
                    break
                }
                case 'sending': {
                    result.name = 'query_builder'
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
            if (this.entry.gid === genesises.main.id) {
                return ''
            }
            return this.$netDisplayName(this.entry.gid)
        }
    },
    methods: {
        copy(str: string) {
            copyText(str).then(() => {
                this.$q.notify(this.$t('common.copied'))
            }).catch(console.error)
        },
        openLink(link: string) {
            const regexp = this.entry.type === 'tx' ? /{txid}/g : /{certid}/g
            openURL(link.replace(regexp, this.entry.id))
        },
        viewOnExplorer() {
            openURL(`${this.txDetailUrl}${this.entry.id}`)
        },
        viewContent() {
            this.$q.dialog({
                parent: this,
                title: this.$t('activities.title_signed_content').toString(),
                message: this.entry.message,
                ok: false
            })
        },
        formatDate(date: number) {
            return formatDate(date, { relative: true })
        }
    }
})
</script>
