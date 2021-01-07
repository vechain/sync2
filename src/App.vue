<template>
    <div
        id="q-app"
        class="non-selectable full-height"
    >
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { listen } from 'src/utils/external-url'

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
            this.$i18n.locale = (newVal || navigator.language).toLowerCase()
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
                try {
                    // the incoming url looks like connex:sign?rid=xxx
                    const url = new URL(await listen())
                    if (url.pathname === 'sign' && !destroyed) {
                        const src = url.searchParams.get('src')
                        if (this.$route.name === 'sign') {
                            this.$router.replace({ name: 'sign', query: { src } })
                        } else {
                            this.$router.push({ name: 'sign', query: { src } })
                        }
                    }
                } catch (err) {
                    console.warn(err)
                }
            }
        }
    },
    created() {
        console.log(`[Sync2] v${process.env.APP_VERSION} (${process.env.APP_BUILD})`)
        this.externalSignHandlerLoop()
    }
})
</script>
