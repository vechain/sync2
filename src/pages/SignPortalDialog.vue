<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-hide=""
        transition-show=""
    >
        <q-card class="fit column flex-center">
            <!-- resolve request -->
            <async
                :fn="resolveRelayedRequest"
                v-slot="{data, error, pending, reload}"
            >
                <q-avatar
                    square
                    size="lg"
                    v-show="!!data"
                >
                    <q-img :src="favicon" />
                </q-avatar>
                <div v-if="pending">
                    resolving input...
                </div>
                <template v-if="!!error">
                    <div>
                        error: {{error}}
                    </div>
                    <q-btn @click="reload">Reload</q-btn>
                </template>
                <template v-if="!!data">
                    <div> origin: {{origin}}</div>
                    <div> type: {{data.type}}</div>
                    <q-btn
                        v-if="!relayedResponse"
                        @click="signRelayedRequest(data)"
                    >Proceed</q-btn>
                </template>
            </async>
            <!-- submit response -->
            <async
                v-if="!!relayedResponse"
                :fn="handleRelayedResponse"
                v-slot="{pending}"
            >
                <div v-if="pending">submitting response...</div>
                <q-btn
                    v-else
                    @click="hide()"
                >Done</q-btn>
            </async>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import * as V from 'validator-ts'
import { urls } from 'src/consts'
import { blake2b256 } from 'thor-devkit/dist/cry/blake2b'
import { QDialog } from 'quasar'

/** request relayed by TOS */
type RelayedRequest = {
    type: 'tx' | 'cert'
    gid?: string // genesis id which to specify network. defaults to mainnet
    payload: {
        message: object
        options: object
    }
    /* nonce: string */
}

namespace RelayedRequest {
    export const scheme: V.Scheme<RelayedRequest> = {
        type: v => (v === 'tx' || v === 'cert') ? '' : `unsupported type '${v}'`,
        gid: v => (!v || /^0x[0-9a-f]{64}$/i.test(v)) ? '' : `invalid gid '${v}'`,
        payload: {
            message: v => v instanceof Object ? '' : 'message requires object type',
            options: v => v instanceof Object ? '' : 'options requires object type'
        }
    }
}

/** response relayed by TOS */
type RelayedResponse = {
    error?: string
    payload?: object
}

export default Vue.extend({
    props: {
        rid: String // the request id
    },
    data: () => {
        return {
            origin: '',
            relayedResponse: null as RelayedResponse | null
        }
    },
    computed: {
        favicon(): string { return `${urls.tos}${this.rid}/icon?size=48..96..128` },
        domain(): string {
            try {
                return new URL(this.origin).host
            } catch {
                return ''
            }
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },

        async resolveRelayedRequest() {
            const resp = await this.$axios.get(
                urls.tos + this.rid,
                { transformResponse: data => data } // raw data is needed to verify hash
            )
            const computedRid = blake2b256(resp.data).toString('hex')
            if (computedRid !== this.rid) {
                throw new Error('id and content mismatch')
            }
            const request = V.validate<RelayedRequest>(JSON.parse(resp.data), RelayedRequest.scheme)
            this.origin = resp.headers['x-data-origin']
            // TODO validate body
            return request
        },
        async signRelayedRequest(request: RelayedRequest) {
            const { type, gid, payload } = request
            const relayedResponse: RelayedResponse = {}
            try {
                if (type === 'tx') {
                    relayedResponse.payload = await this.$signTx(gid || '', payload as M.TxRequest)
                } else if (type === 'cert') {
                    relayedResponse.payload = await this.$signCert(gid || '', {
                        ...(payload as M.CertRequest),
                        domain: this.domain
                    })
                }
            } catch (err) {
                relayedResponse.error = err
            }
            this.relayedResponse = relayedResponse
        },
        async handleRelayedResponse() {
            for (let i = 0; i < 3; i++) {
                try {
                    await this.$axios.post(urls.tos + this.rid + '-resp', this.relayedResponse)
                    return
                } catch (err) {
                    console.warn(err)
                }
            }
        }
    }
})
</script>
