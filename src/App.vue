<template>
    <div
        id="q-app"
        class="non-selectable"
    >
        <router-view v-if="ready" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { listen } from 'core/connex/external-url'
import SignPortalDialog from 'pages/SignPortalDialog'
import { DialogChainObject } from 'quasar'

export default Vue.extend({
    computed: {
        ready() {
            return this.$state.wallet.ready &&
                this.$state.config.ready
        }
    },
    methods: {
        async externalSignHandlerLoop() {
            let destroyed = false
            let current = null as DialogChainObject | null
            this.$once('hook:beforeDestroy', () => {
                destroyed = true
            })

            const excludedOpen = (rid: string) => {
                return new Promise(resolve => {
                    if (current) {
                        current.hide()
                    }
                    const newDlg = this.$q.dialog({
                        component: SignPortalDialog,
                        rid
                    }).onDismiss(() => {
                        if (newDlg === current) {
                            current = null
                            // dialog normally closed, go to index page if not loaded
                            if (!this.$route.name) {
                                this.$router.replace({ name: 'index' })
                            }
                        }
                        resolve()
                    })
                    current = newDlg
                })
            }

            this.$on('sign', (rid: string, cb: () => void) => {
                excludedOpen(rid).then(cb)
            })

            // eslint-disable-next-line no-unmodified-loop-condition
            while (!destroyed) {
                try {
                    // the incoming url looks like connex:sign?rid=xxx
                    const url = new URL(await listen())
                    if (url.pathname === 'sign' && !destroyed) {
                        const rid = url.searchParams.get('rid')
                        excludedOpen(rid!)
                    }
                } catch (err) {
                    console.warn(err)
                }
            }
        }
    },
    created() {
        console.log(`[Sync2] v${process.env.APP_VERSION} (${process.env.APP_BUILD})`)

        Object.defineProperty(window, 'APP', {
            get: () => { return this }
        })

        this.externalSignHandlerLoop()
    }
})
</script>
