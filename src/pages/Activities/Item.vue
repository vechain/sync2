<template>
    <q-list class="q-pt-md">
        <q-item class="q-py-none q-pr-lg">
            <q-item-section avatar>
                <AddressAvatar
                    class="q-mx-auto relative-position"
                    style="width: 40px; height: 40px; border-radius: 20px;"
                    :addr="info.signer"
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
                >{{ info.walletName || '--' }}</q-item-label>
                <q-item-label
                    caption
                    lines="1"
                >{{ info.signer | abbrev(8, 6) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <slot name="status" />
            </q-item-section>
        </q-item>
        <div class="q-px-md text-body2 q-pt-xs">
            {{info.comment}}
        </div>
        <div
            v-if="info.link"
            class="q-px-lg text-grey q-pt-xs text-caption"
        >
            <q-icon
                name="link"
                size="xs"
            />
            {{info.refererText}}
        </div>
        <div class="q-px-md text-grey q-pt-xs text-caption row justify-between items-center">
            <span>
                {{info.time}}
            </span>
            <q-btn
                round
                flat
                size="sm"
                @click="onClick"
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
import { urls, genesises } from 'src/consts'
export type Info = {
    gid: string,
    walletName?: string
    signer: string
    comment: string
    refererText: string
    txId?: string
    time: string
    link: string
    message?: string
}
export default Vue.extend({
    props: {
        info: {
            type: Object as () => Info
        }
    },
    computed: {
        txDetailUrl(): string {
            switch (genesises.which(this.info.gid)) {
                case 'main':
                    return `${urls.explorerMain}transactions/`
                case 'test':
                    return `${urls.explorerTest}transactions/`
                default:
                    return ''
            }
        },
        networkBadgeText(): string {
            const net = Vue.filter('net')(this.info.gid)
            if (net === 'main') {
                return ''
            }
            return net
        }
    },
    methods: {
        copy(str: string) {
            copyToClipboard(str).then(() => {
                this.$q.notify('copied')
            }).catch(console.error)
        },
        viewOnExplorer() {
            openURL(`${this.txDetailUrl}${this.info.txId}`)
        },
        viewContent() {
            this.$q.dialog({
                title: 'Signed Content',
                message: this.info.message
            })
        },
        onClick() {
            let actions: {
                label: string,
                classes?: string | string[],
                onClick?: Function
            }[] = []

            if (this.info.txId) {
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
                            this.copy(this.info.txId!)
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
            if (this.info.link) {
                actions.push({
                    label: 'Copy dApp URL',
                    onClick: () => {
                        this.copy(this.info.link)
                    }
                })
            }
            this.$actionSheets(actions)
        }
    }
})
</script>
