<template>
    <div
        id="q-app"
        class="non-selectable"
    >
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { listen } from 'src/utils/external-url'

export default Vue.extend({
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
                        const rurl = url.searchParams.get('rurl')
                        if (this.$route.name === 'sign') {
                            this.$router.replace({ name: 'sign', query: { rurl } })
                        } else {
                            this.$router.push({ name: 'sign', query: { rurl } })
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
