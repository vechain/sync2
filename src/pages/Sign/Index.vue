<template>
    <!-- load request -->
    <async
        :fn="loadRequest"
        v-slot="{data, error, pending}"
        tag="div"
        class="column fit q-pa-md no-wrap"
    >
        <!-- loading -->
        <delay
            v-if="pending"
            :t="200"
            tag="div"
            class="q-my-auto text-center"
        >
            <p>
                <q-spinner-dots class="text-h2" />
            </p>
            <p>Loading signing content ...</p>
        </delay>
        <!-- error to load -->
        <div
            v-else-if="error"
            class="q-my-auto text-center"
        >
            <p>
                <q-icon
                    name="error"
                    class="text-red text-h2"
                />
            </p>
            <p>Failed to load content</p>
        </div>
        <!-- summary -->
        <div
            v-else
            v-scrollDivider.both
            class="row self-stretch q-mb-auto justify-center overflow-auto"
        >
            <Summary
                class="col-sm-8 col-12"
                :origin="origin"
                :request="data"
            />
        </div>
        <!-- actions -->
        <div class="row justify-evenly self-stretch q-mt-md q-gutter-sm">
            <q-btn
                v-if="error"
                unelevated
                color="primary"
                class="col-6 col-sm-3"
                @click="close()"
            >Close</q-btn>
            <template v-else-if="data">
                <q-btn
                    unelevated
                    color="primary"
                    class="col-6 col-sm-3"
                    @click="signRequest(data)"
                >Continue</q-btn>
                <div class="col-12" />
                <q-btn
                    flat
                    color="negative"
                    class="col-6 col-sm-3"
                    @click="close()"
                >Decline</q-btn>
            </template>
        </div>
    </async>
</template>
<script lang="ts">
import Vue from 'vue'
import { RelayedRequest, RelayedResponse } from './models'
import { blake2b256 } from 'thor-devkit'
import Summary from './Summary.vue'

export default Vue.extend({
    components: { Summary },
    props: {
        rurl: String // the url to fetch request object
    },
    data: () => {
        return {
            origin: '',
            responded: false
        }
    },
    computed: {
        host(): string {
            try {
                return new URL(this.origin).host
            } catch {
                return ''
            }
        }
    },
    methods: {
        async loadRequest() {
            const urlObject = new URL(this.rurl)
            if (!['http:', 'https:'].includes(urlObject.protocol)) {
                throw new Error('invalid request')
            }

            const rid = urlObject.pathname.split('/').pop() || ''
            if (!/^[0-9a-f]{64}$/i.test(rid)) {
                throw new Error('invalid request')
            }

            const resp = await (async () => {
                for (let i = 0; i < 3; i++) {
                    try {
                        const resp = await this.$axios.get(
                            `${this.rurl}?wait=1`,
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

            const dataHash = blake2b256(resp.data).toString('hex')
            if (dataHash !== rid) {
                throw new Error('incorrect content hash')
            }
            const request = RelayedRequest.validate(JSON.parse(resp.data))
            this.origin = resp.headers['x-data-origin']
            this.postStatus('-accepted', {})
            // TODO validate body
            return request
        },
        async signRequest(request: RelayedRequest) {
            try {
                const { type, gid, payload } = request
                let result = null
                if (type === 'tx') {
                    result = await this.$signTx(gid || '', payload as M.TxRequest)
                } else if (type === 'cert') {
                    result = await this.$signCert(gid || '', {
                        ...(payload as M.CertRequest),
                        domain: this.host
                    })
                }
                this.respond({ payload: result! })
                this.$router.replace({ name: 'sign-success', query: { type } })
            } catch (err) {
                console.warn(err)
            }
        },
        async postStatus(suffix: string, result: object) {
            for (let i = 0; i < 3; i++) {
                try {
                    await this.$axios.post(`${this.rurl}${suffix}`, result)
                    return
                } catch (err) {
                    console.warn(err)
                    await new Promise(resolve => setTimeout(resolve, 2 * 1000))
                }
            }
        },
        respond(resp?: RelayedResponse) {
            if (!this.responded) {
                this.responded = true
                this.postStatus('-resp', resp || {
                    error: 'user decline'
                })
            }
        },
        close() {
            if (this.$stack.canGoBack) {
                this.$router.back()
            } else {
                this.$router.replace({ name: 'index' })
            }
        }
    },
    beforeDestroy() {
        this.respond()
    }
})
</script>
