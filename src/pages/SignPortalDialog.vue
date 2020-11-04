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
                :fn="resolveRequest"
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
                    <q-btn @click="signRequest(data)">Proceed</q-btn>
                </template>
            </async>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import * as V from 'validator-ts'
import { urls } from 'src/consts'
import { blake2b256 } from 'thor-devkit'
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
            origin: ''
        }
    },
    computed: {
        baseUrl(): string { return `${urls.tos}${encodeURIComponent(this.rid)}` },
        favicon(): string { return `${this.baseUrl}/icon?size=48..96..128` },
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

        async resolveRequest() {
            const resp = await (async () => {
                for (let i = 0; i < 3; i++) {
                    try {
                        const resp = await this.$axios.get(
                            `${this.baseUrl}?wait=1`,
                            { transformResponse: data => data } // raw data is needed to verify hash
                        )
                        if (resp.data) {
                            return resp
                        }
                    } catch {
                        await new Promise(resolve => setTimeout(resolve, 2000))
                    }
                }
                throw new Error('can not resolve request')
            })()

            const computedRid = blake2b256(resp.data).toString('hex')
            if (computedRid !== this.rid) {
                throw new Error('id and content mismatch')
            }
            const request = V.validate<RelayedRequest>(JSON.parse(resp.data), RelayedRequest.scheme)
            this.origin = resp.headers['x-data-origin']
            this.postResult('-accepted', {})
            // TODO validate body
            return request
        },
        async signRequest(request: RelayedRequest) {
            const { type, gid, payload } = request
            const resp: RelayedResponse = {}
            try {
                if (type === 'tx') {
                    resp.payload = await this.$signTx(gid || '', payload as M.TxRequest)
                } else if (type === 'cert') {
                    resp.payload = await this.$signCert(gid || '', {
                        ...(payload as M.CertRequest),
                        domain: this.domain
                    })
                }
            } catch (err) {
                resp.error = err.message
            }
            this.postResult('-resp', resp)
            this.hide()
        },
        async postResult(suffix: string, result: object) {
            for (let i = 0; i < 3; i++) {
                try {
                    this.$axios.post(`${this.baseUrl}${suffix}`, result)
                    return
                } catch (err) {
                    console.warn(err)
                    await new Promise(resolve => setTimeout(resolve, 2 * 1000))
                }
            }
        }
    }
})
</script>
