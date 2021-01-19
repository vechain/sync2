<template>
    <div class="column fit no-wrap">
        <page-toolbar
            :title="$t('sign.title')"
            :gid="request && request.gid"
        />
        <page-content
            class="col q-py-md"
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
                    <p>{{$t('sign.msg_loading_content')}}</p>
                </delay-render>
                <!-- error -->
                <template v-else-if="$asyncComputed.request.exception">
                    <p>
                        <q-icon
                            name="error"
                            class="text-negative text-h2"
                        />
                    </p>
                    <p>{{$t('sign.msg_loading_failed')}}</p>
                    <p class="text-negative">{{$asyncComputed.request.exception.message}}</p>
                </template>
            </div>
        </page-content>
        <!-- actions -->
        <page-action>
            <template v-if="request">
                <q-btn
                    outline
                    :label="$t('common.decline')"
                    color="negative"
                    @click="$backOrHome()"
                />
                <q-btn
                    unelevated
                    :label="$t('common.continue')"
                    color="primary"
                    @click="signRequest()"
                />
            </template>
            <q-btn
                v-else-if="$asyncComputed.request.exception"
                unelevated
                :label="$t('common.close')"
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

const ACCEPTED_SUFFIX = '.accepted'
const RESP_SUFFIX = '.resp'

export default Vue.extend({
    components: { Summary, DelayRender, PageToolbar, PageContent, PageAction },
    props: {
        src: String // the url to fetch request object
    },
    data: () => {
        return {
            responded: false
        }
    },
    computed: {
        urlObject(): URL | null {
            try {
                const obj = new URL(this.src)
                if (['http:', 'https:'].includes(obj.protocol)) {
                    return obj
                }
                return null
            } catch (err) {
                console.warn(err)
                return null
            }
        }
    },
    asyncComputed: {
        async request(): Promise<RelayedRequest | null> {
            const urlObject = this.urlObject
            if (!urlObject) {
                throw new Error(this.$t('sign.msg_invalid_request').toString())
            }

            const rid = urlObject.pathname.split('/').pop() || ''
            if (!/^[0-9a-f]{64}$/i.test(rid)) {
                throw new Error(this.$t('sign.msg_invalid_request').toString())
            }

            const resp = await (async () => {
                for (let i = 0; i < 3; i++) {
                    try {
                        const resp = await this.$axios.get(
                            `${this.src}?wait=1`,
                            { transformResponse: data => data } // raw data is needed to verify hash
                        )
                        if (resp.data) {
                            return resp
                        }
                    } catch {
                        await new Promise(resolve => setTimeout(resolve, 2000))
                    }
                }
                throw new Error(this.$t('sign.msg_fetch_request_failed').toString())
            })()

            const dataHash = blake2b256(resp.data).toString('hex')
            if (dataHash !== rid) {
                throw new Error(this.$t('sign.msg_request_hash_mismatch').toString())
            }
            const request = RelayedRequest.validate(JSON.parse(resp.data))
            request.origin = resp.headers['x-data-origin']
            // eslint-disable-next-line @typescript-eslint/camelcase
            this.$gtag.event('connex-sign', { event_label: request.origin })
            this.postStatus(ACCEPTED_SUFFIX, {})
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
            const { gid } = request
            const wallets = await this.$svc.wallet.getByGid(gid)

            // if no suitable wallet, ask to create one
            if (wallets.length === 0) {
                try {
                    await this.$dialog({
                        title: this.$t('sign.title_ask_create_wallet').toString(),
                        message: this.$t('sign.message_ask_create_wallet').toString(),
                        ok: {
                            label: this.$t('common.ok'),
                            unelevated: true,
                            color: 'primary'
                        },
                        cancel: this.$t('common.cancel').toString()
                    })
                    this.$router.push({
                        name: 'new-wallet',
                        query: { defaultGid: gid }
                    })
                } catch { }
                return
            }

            let result = null
            if (request.type === 'tx') {
                const { payload } = request
                result = await this.$signTx(gid, {
                    message: payload.message,
                    options: payload.options,
                    origin: request.origin
                })
            } else if (request.type === 'cert') {
                let host
                try {
                    host = new URL(request.origin!).host
                } catch {
                }
                const { payload } = request
                result = await this.$signCert(gid, {
                    message: payload.message,
                    options: payload.options,
                    origin: request.origin,
                    domain: host || ''
                })
            }
            this.respond({ payload: result! })
            this.$router.replace({ name: 'sign-success', query: { type: request.type } })
        },
        async postStatus(suffix: string, result: object) {
            for (let i = 0; i < 3; i++) {
                try {
                    await this.$axios.post(`${this.src}${suffix}`, result)
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
                this.postStatus(RESP_SUFFIX, resp || {
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
