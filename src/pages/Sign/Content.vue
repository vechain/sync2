<template>
    <q-card-section>
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
            <p class="text-subtitle1">Your signature is being requested</p>
        </div>

        <!-- descriptions -->
        <div class="text-caption text-grey">From DApp</div>
        <p>{{origin}}</p>
        <div class="text-caption text-grey">Type</div>
        <p>{{type}}</p>
        <div class="text-caption text-grey">Summary</div>
        <p>{{summary}}</p>
    </q-card-section>
</template>
<script lang="ts">
import Vue from 'vue'
import { RelayedRequest } from './models'

export default Vue.extend({
    data: () => {
        return {
            iconLoaded: false
        }
    },
    props: {
        origin: String,
        request: Object as () => RelayedRequest
    },
    computed: {
        host(): string {
            try {
                return new URL(this.origin).host
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
                case 'tx': return 'Transaction'
                case 'cert': return 'Certificate'
                default: return 'Unknown'
            }
        },
        summary(): string {
            const req = this.request
            if (req.type === 'tx') {
                return (req.payload as M.TxRequest).options?.comment || ''
            } else if (req.type === 'cert') {
                const msg = (req.payload as M.CertRequest).message
                switch (msg.purpose) {
                    case 'identification': return 'Identification purpose'
                    case 'agreement': return 'Agreement purpose'
                    default: return 'Unknown purpose'
                }
            }
            return 'None'
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
