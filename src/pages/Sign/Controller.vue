<template>
    <div class="column fit no-wrap">
        <page-toolbar
            title="Sign"
            :gid="request && request.gid"
        />
        <page-content
            class="col"
            padding
            innerClass="fit column"
        >
            <!-- content -->
            <Summary
                v-if="request"
                :request="request"
            />
            <div
                v-else
                class="q-my-auto text-center"
            >
                <!-- loading -->
                <delay-render
                    v-if="$asyncComputed.request.updating"
                    :t="200"
                >
                    <p>
                        <q-spinner-dots class="text-h2" />
                    </p>
                    <p>Loading signing content ...</p>
                </delay-render>
                <!-- error -->
                <template v-else-if="$asyncComputed.request.exception">
                    <p>
                        <q-icon
                            name="error"
                            class="text-negative text-h2"
                        />
                    </p>
                    <p>Failed to load content</p>
                    <p class="text-negative">{{$asyncComputed.request.exception.message}}</p>
                </template>
            </div>
        </page-content>
        <!-- actions -->
        <page-action>
            <template v-if="request">
                <q-btn
                    outline
                    label="Decline"
                    color="negative"
                    @click="$backOrHome()"
                />
                <q-btn
                    unelevated
                    label="Continue"
                    color="primary"
                    @click="signRequest()"
                />
            </template>
            <q-btn
                v-else-if="$asyncComputed.request.exception"
                unelevated
                label="Close"
                color="primary"
                @click="$backOrHome()"
            />
        </page-action>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { RelayedRequest, RelayedResponse } from './models'
import { blake2b256 } from 'thor-devkit'
import Summary from './Summary.vue'
import DelayRender from 'components/DelayRender'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'

export default Vue.extend({
    components: { Summary, DelayRender, PageToolbar, PageContent, PageAction },
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
