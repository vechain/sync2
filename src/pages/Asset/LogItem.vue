<template>
    <q-expansion-item
        v-bind="$attrs"
        expand-icon-class="hidden"
    >
        <template v-slot:header>
            <q-item-section avatar>
                <q-chip
                    square
                    dense
                    :class=" 'bg-' + logStyle.color"
                    class="text-white truncate-chip-labels"
                >
                    <q-icon :name="logStyle.icon" />
                </q-chip>
            </q-item-section>
            <q-item-section>
                <q-item-label lines="1">
                    <address-label :addr="addressText" />
                </q-item-label>
                <q-item-label
                    caption
                    lines="2"
                    v-if="!dense"
                >
                    {{formatDate(log.meta.blockTimestamp)}}
                </q-item-label>
            </q-item-section>
            <q-item-section side>
                <span :class="'text-' + logStyle.color">
                    {{logStyle.mark}}
                    <amount-label
                        :value="amount"
                        :decimals="token.decimals"
                    > --.-- </amount-label>
                </span>
            </q-item-section>
        </template>
        <template>
            <q-item>
                <q-item-section />
                <q-item-section />
                <q-item-section side>
                    <div class="q-gutter-md">
                        <q-btn
                            rounded
                            @click="copy(log.meta.txID)"
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
                    </div>
                </q-item-section>
            </q-item>
        </template>
    </q-expansion-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressLabel from 'src/components/AddressLabel.vue'
import { copyToClipboard, openURL } from 'quasar'
import AmountLabel from 'components/AmountLabel.vue'
import { urls, genesises } from 'src/consts'
import { TransferLogItem } from './models'
import { formatDate } from 'src/utils/format'

export default Vue.extend({
    components: {
        AddressLabel,
        AmountLabel
    },
    props: {
        log: Object as () => TransferLogItem,
        address: String,
        dense: Boolean
    },
    computed: {
        token(): M.TokenSpec {
            return this.log.token
        },
        amount(): string | number {
            return this.log.amount
        },
        addressText(): string {
            return this.log.direction === '+' ? this.log.sender : this.log.recipient
        },
        logStyle(): { icon: string, color: string, mark: string } {
            if (this.log.direction === '+') {
                return {
                    icon: 'arrow_downward',
                    color: 'positive',
                    mark: this.log.direction
                }
            } else {
                return {
                    icon: 'arrow_upward',
                    color: 'negative',
                    mark: this.log.direction
                }
            }
        },
        txDetailUrl(): string {
            switch (genesises.which(this.log.token.gid)) {
                case 'main':
                    return `${urls.explorerMain}transactions/`
                case 'test':
                    return `${urls.explorerTest}transactions/`
                default:
                    return ''
            }
        }
    },
    methods: {
        formatDate(timestamp: number) {
            return formatDate(timestamp * 1000, { relative: true })
        },
        viewOnExplorer() {
            openURL(`${this.txDetailUrl}${this.log.meta.txID}`)
        },
        copy(str: string) {
            copyToClipboard(str).then(() => {
                this.$q.notify(this.$t('common.copied'))
            }).catch(console.error)
        }
    }
})
</script>
