<template>
    <div>
        <div class="text-center">
            <!-- img loader -->
            <img
                v-if="!!faviconUrl"
                v-show="false"
                :src="faviconUrl"
                @load="iconLoaded=true"
            >

            <!-- favicon -->
            <div class="relative-position favicon-frame q-mx-auto">
                <transition
                    mode="out-in"
                    name="q-transition--fade"
                >
                    <img
                        v-if="iconLoaded"
                        class="fit absolute-full"
                        :src="faviconUrl"
                    >
                    <div
                        v-else
                        class="fit text-h4 bg-grey-4 column justify-center"
                    >{{(host[0]|| '?').toUpperCase()}}</div>
                </transition>
            </div>
            <p />
            <p class="text-subtitle1">{{$t('sign.msg_request_signature')}}</p>
        </div>
        <!-- descriptions -->
        <q-list>
            <q-item
                v-for="(item, i) in items"
                :key="i"
            >
                <q-item-section>
                    <q-item-label caption>{{item.caption}}</q-item-label>
                    <q-item-label>{{item.text}}</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { RelayedRequest } from './models'

type Item = {
    caption: string
    text: string
}

export default Vue.extend({
    data: () => {
        return {
            iconLoaded: false
        }
    },
    props: {
        request: Object as () => RelayedRequest
    },
    computed: {
        host(): string {
            try {
                return new URL(this.request.origin || '').host
            } catch {
                return ''
            }
        },
        faviconUrl(): string {
            return this.host
                ? `https://api.faviconkit.com/${encodeURIComponent(this.host)}/128`
                : ''
        },
        type(): string {
            switch (this.request.type) {
                case 'tx': return this.$t('common.transaction').toString()
                case 'cert': return this.$t('common.certificate').toString()
                default: return this.$t('common.unknown').toString()
            }
        },
        summary(): Item | null {
            const req = this.request
            if (req.type === 'tx') {
                return {
                    caption: this.$t('sign.label_request_summary').toString(),
                    text: (req.payload as M.TxRequest).options?.comment || this.$t('common.none').toString()
                }
            } else if (req.type === 'cert') {
                const msg = (req.payload as M.CertRequest).message
                switch (msg.purpose) {
                    case 'identification': return {
                        caption: 'Purpose',
                        text: this.$t('sign.label_identification_purpose').toString()
                    }
                    case 'agreement': return {
                        caption: 'Purpose',
                        text: this.$t('sign.label_agreement_purpose').toString()
                    }
                    default: return null
                }
            }
            return null
        },
        items(): Array<Item> {
            const items = [{
                caption: this.$t('sign.label_request_from').toString(),
                text: this.request.origin || ''
            }, {
                caption: this.$t('sign.label_request_type').toString(),
                text: this.type
            }]
            this.summary && items.push(this.summary)
            return items
        }
    }
})
</script>
<style scoped>
.favicon-frame {
    width: 64px;
    height: 64px;
}
</style>
