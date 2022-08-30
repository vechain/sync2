<template>
    <div
        id="q-app"
        class="full-height"
    >
        <router-view class="fit" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { listen } from 'src/utils/external-url'
import dayjs from 'dayjs'
// import more locales here
import 'dayjs/locale/zh-cn'

/**
 * parse connex request url and return the request src
 * the incoming url looks like connex:sign?src=xxx, or https://lite.sync.vecha.in/#/sign?src=xxx
 */
function parseConnexURL(urlStr: string) {
    try {
        // normalize for easily parsing
        if (urlStr.startsWith('https')) {
            urlStr = urlStr.replace('/#', '')
        }
        const url = new URL(urlStr)
        if ((url.protocol === 'connex:' && url.pathname === 'sign') ||
            (url.protocol === 'https:' && url.pathname === '/sign')
        ) {
            return { route: 'sign', query: { src: url.searchParams.get('src') } }
        }

        if ((url.protocol === 'connex:' && url.pathname === 'fee-delegation-setting') ||
            (url.protocol === 'https:' && url.pathname === '/fee-delegation-setting')
        ) {
            return { route: 'fee-delegation-setting', query: { config: url.searchParams.get('config') } }
        }
    } catch (err) {
        console.warn(err)
    }
    return null
}

export default Vue.extend({
    asyncComputed: {
        lang(): Promise<string> {
            return this.$svc.config.getLanguage()
        }
    },
    watch: {
        // watch the language setting change
        lang(newVal: string) {
            // if language not set (auto), use the navigator lang
            const lang = (newVal || navigator.language).toLowerCase()
            this.$i18n.locale = lang

            // should set to default first
            dayjs.locale('en')
            dayjs.locale(lang)
        }
    },
    methods: {
        async externalSignHandlerLoop() {
            let destroyed = false
            this.$once('hook:beforeDestroy', () => {
                destroyed = true
            })

            // eslint-disable-next-line no-unmodified-loop-condition
            while (!destroyed) {
                const routing = parseConnexURL(await listen())
                if(routing) {
                    const { route, query } = routing
                    if (['sign', 'fee-delegation-setting'].includes(route)) {
                        if (this.$route.name === route) {
                            this.$router.replace({ name: route, query })
                        } else {
                            this.$router.push({ name: route, query })
                        }
                    }
                }
            }
        }
    },
    created() {
        console.log(`[Sync2] v${process.env.APP_VERSION} (${process.env.APP_BUILD})`)
        this.externalSignHandlerLoop()

        // to watch available update for electron build only
        // the approach for the PWA mode is in src-pwa/register-service-worker.js
        if (process.env.MODE === 'electron') {
            require('@electron/remote').app.updater.downloaded.then(() => {
                this.$state.app.updateAvailable = true
            })
        } else if (process.env.MODE === 'cordova') {
            window.StatusBar.backgroundColorByName('white')
            window.StatusBar.styleDefault()
        }
    }
})
</script>
