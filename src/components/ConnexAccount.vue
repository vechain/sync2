<template>
    <component
        :is="tag"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <slot v-bind="{account, connex}" />
    </component>
</template>
<script lang="ts">
import Vue from 'vue'
import { retain } from 'core/connex/pool'

export default Vue.extend({
    props: {
        tag: { default: 'div' },
        address: String,
        network: { type: Object as () => M.Network }
    },
    data: () => {
        return {
            trackId: 0,
            account: null as Connex.Thor.Account | null,
            connex: null as Connex | null
        }
    },
    watch: {
        address() {
            this.track()
        },
        network() {
            this.track()
        }
    },
    created() {
        this.track()
    },
    beforeDestroy() {
        this.trackId++
    },
    methods: {
        async track() {
            const trackId = ++this.trackId
            this.connex = null
            this.account = null

            const connex = await this.getConnex()
            if (!connex) {
                return
            }

            this.connex = connex
            const ticker = connex.thor.ticker()
            const visitor = connex.thor.account(this.address)
            for (; ;) {
                try {
                    const acc = await visitor.get()
                    if (trackId !== this.trackId) {
                        return
                    }
                    this.account = acc
                } catch (err) {
                    console.log(err)
                    if (trackId !== this.trackId) {
                        return
                    }
                }
                await ticker.next()
            }
        },
        async getConnex() {
            const trackId = this.trackId
            for (; ;) {
                try {
                    return await retain({
                        url: this.network.nodeUrl,
                        genesisId: this.network.id
                    })
                } catch (err) {
                    console.log(err)
                    if (trackId !== this.trackId) {
                        return
                    }
                    await new Promise(resolve => setTimeout(resolve, 10 * 1000))
                }
            }
        }
    }
})
</script>
