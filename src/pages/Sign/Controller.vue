<template>
    <div class="column fit">
        <page-toolbar
            title="Sign"
            :gid="request && request.gid"
        />
        <!-- loading -->
        <delay
            v-if="$asyncComputed.request.updating"
            :t="200"
            tag="div"
            class="q-my-auto q-pa-md text-center"
        >
            <p>
                <q-spinner-dots class="text-h2" />
            </p>
            <p>Loading signing content ...</p>
        </delay>
        <!-- request content -->
        <template v-else-if="request">
            <!-- content -->
            <div
                class="col overflow-auto q-pa-md"
                v-scrollDivider.both
            >
                <Summary
                    class="narrow-page q-mx-auto"
                    :request="request"
                />
            </div>
            <!-- actions -->
            <div class="narrow-page q-mx-auto q-pa-sm row justify-around">
                <q-btn
                    outline
                    label="Decline"
                    color="negative"
                    class="w40"
                    @click="$backOrHome()"
                />
                <q-btn
                    unelevated
                    label="Continue"
                    color="primary"
                    class="w40"
                    @click="signRequest()"
                />
            </div>
        </template>
        <!-- error to load -->
        <template v-else-if="$asyncComputed.request.exception">
            <div
                class="col overflow-auto q-pa-md flex flex-center"
                v-scrollDivider.both
            >
                <div class="narrow-page text-center">
                    <p>
                        <q-icon
                            name="error"
                            class="text-red text-h2"
                        />
                    </p>
                    <p>Failed to load content</p>
                    <p class="text-grey">{{$asyncComputed.request.exception.message}}</p>
                </div>
            </div>
            <!-- actions -->
            <div class="narrow-page q-mx-auto q-pa-sm row justify-around">
                <q-btn
                    outline
                    label="Close"
                    color="negative"
                    class="w40"
                    @click="$backOrHome()"
                />
                <q-btn
                    unelevated
                    label="Retry"
                    color="primary"
                    class="w40"
                    @click="$asyncComputed.request.update()"
                />
            </div>
        </template>
    </div>
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
            responded: false
        }
    },
    asyncComputed: {
        async request(): Promise<RelayedRequest | null> {
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
            request.origin = resp.headers['x-data-origin']
            this.postStatus('-accepted', {})
            // TODO validate body
            return request
        }
    },
    methods: {
        async signRequest() {
            const request = this.request
            if (!request) {
                return
            }
            try {
                const { type, gid, payload } = request
                let result = null
                if (type === 'tx') {
                    result = await this.$signTx(gid, payload as M.TxRequest)
                } else if (type === 'cert') {
                    let host
                    try {
                        host = new URL(this.request!.origin!).host
                    } catch {
                    }
                    result = await this.$signCert(gid, {
                        ...(payload as M.CertRequest),
                        domain: host || ''
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
        }
    },
    beforeDestroy() {
        this.respond()
    }
})
</script>
