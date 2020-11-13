<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-hide=""
        transition-show=""
    >
        <!-- load request -->
        <async
            :fn="loadRequest"
            v-slot="{data, error, pending}"
            tag="q-card"
            class="column"
        >
            <!-- toolbar -->
            <q-toolbar>
                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click="hide()"
                />
                <q-toolbar-title class="absolute-center">
                    Sign
                </q-toolbar-title>
            </q-toolbar>

            <!-- loading -->
            <delay
                :t="200"
                v-if="pending || !ready"
                tag="q-card-section"
                class="col column flex-center"
            >
                <p>
                    <q-spinner-dots size="3rem" />
                </p>
                <p>Loading signing content ...</p>
            </delay>

            <!-- error loading -->
            <div
                v-else-if="!!error"
                class="col column no-wrap justify-center"
            >
                <q-card-section class="text-center">
                    <p>
                        <q-icon
                            name="error"
                            class="text-red text-h2"
                        />
                    </p>
                    <p>Error occurred</p>
                </q-card-section>
                <q-card-actions class="row justify-center">
                    <q-btn
                        unelevated
                        color="primary"
                        class="col-6 col-sm-auto q-px-lg"
                        @click="hide()"
                    >Close</q-btn>
                </q-card-actions>
            </div>
            <!-- content -->
            <div
                v-else
                class="col column no-wrap"
            >
                <div
                    v-scrollDivider.both
                    class="row overflow-auto justify-center"
                >
                    <Content
                        class="col-sm-8 col-12"
                        :origin="origin"
                        :request="data"
                    />
                </div>
                <q-card-actions class="row justify-evenly">
                    <q-btn
                        unelevated
                        color="grey"
                        class="col-5 col-sm-auto q-px-lg"
                        @click="hide()"
                    >Decline</q-btn>
                    <q-btn
                        unelevated
                        color="positive"
                        class="col-5 col-sm-auto q-px-lg"
                        @click="signRequest(data)"
                    >Continue</q-btn>
                </q-card-actions>
            </div>
        </async>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { urls } from 'src/consts'
import { blake2b256 } from 'thor-devkit'
import { QDialog } from 'quasar'
import Content from './Content.vue'
import { RelayedRequest, RelayedResponse } from './model'

export default Vue.extend({
    components: {
        Content
    },
    props: {
        rid: String // the request id
    },
    data: () => {
        return {
            origin: '',
            responded: false
        }
    },
    computed: {
        ready() { return this.$state.wallet.ready && this.$state.config.ready },
        baseUrl(): string { return `${urls.tos}${encodeURIComponent(this.rid)}` },
        host(): string {
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
        hide(resp?: RelayedResponse) {
            if (!this.responded) {
                this.responded = true
                this.postStatus('-resp', resp || {
                    error: 'user decline'
                })
            }
            (this.$refs.dialog as QDialog).hide()
        },
        async loadRequest() {
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
                throw new Error('can not load request')
            })()

            const computedRid = blake2b256(resp.data).toString('hex')
            if (computedRid !== this.rid) {
                throw new Error('id and content mismatch')
            }
            const request = RelayedRequest.validate(JSON.parse(resp.data))
            this.origin = resp.headers['x-data-origin']
            this.postStatus('-accepted', {})
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
                        domain: this.host
                    })
                }
            } catch (err) {
                resp.error = err.message
            }
            this.hide(resp)
        },
        async postStatus(suffix: string, result: object) {
            for (let i = 0; i < 3; i++) {
                try {
                    await this.$axios.post(`${this.baseUrl}${suffix}`, result)
                    return
                } catch (err) {
                    console.warn(err)
                    await new Promise(resolve => setTimeout(resolve, 2 * 1000))
                }
            }
        }
    },
    created() {
        // the code block below is to post reject response on app closed
        const url = `${this.baseUrl}-resp`
        this.$onWindowEvent('pagehide', () => {
            const resp: RelayedResponse = { error: 'wallet closed' }
            window.navigator.sendBeacon(url, JSON.stringify(resp))
            void (this.$refs.dialog as QDialog).hide()
        })
    }
})
</script>
