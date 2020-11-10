<template>
    <q-card
        :style="{...background}"
        v-bind="$attrs"
        v-on="$listeners"
        class="bg-transition"
    >
        <ConnexContinuous
            :connex="connex"
            :query="()=> connex.thor.account(address).get()"
            v-slot="{data}"
        >
            <q-card-section class="text-white column no-wrap full-height overflow-hidden">
                <div
                    :style="{...iconStyles}"
                    class="absolute"
                ></div>
                <!-- balances -->
                <div class="text-right float-right">
                    <span class="text-h6 text-weight-regular">{{data?data.balance:null | balance}}</span>
                    <span class="monospace text-caption"> VET&nbsp;</span>
                </div>
                <div class="text-right">
                    <span class="text-h6 text-weight-regular">{{data?data.energy:null | balance}}</span>
                    <span class="monospace text-caption"> VTHO</span>
                </div>
                <q-space />
                <!-- address -->
                <div class="row items-baseline">
                    <!-- index -->
                    <span class="index">{{index+1}}</span>
                    <span class="monospace text-overline">{{address | checksum | abbrev(8,6)}}</span>
                    <q-space />
                    <!-- logo -->
                    <div class="logo inline-block" />
                </div>
            </q-card-section>
        </ConnexContinuous>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Color = require('color')

export default Vue.extend({
    props: {
        address: String,
        index: Number,
        connex: Object as () => Connex
    },
    data: () => {
        return {
            height: 0
        }
    },
    computed: {
        svg(): string {
            return picasso(this.address)
        },
        background(): object {
            let str = this.svg
            let color: any
            for (let i = 0; i < 2; i++) {
                const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(str)
                if (m) {
                    color = color ? color.mix(Color(m[0]), 0.25) : Color(m[0])
                    str = str.slice(m.index + m[0].length)
                } else {
                    break
                }
            }

            return {
                background: `linear-gradient(to bottom, ${color.darken(0.6).rgb().string()}, ${color.rgb().string()})`
            }
        },
        iconStyles(): object {
            return {
                background: `url('data:image/svg+xml;utf8,${this.svg}') center / cover no-repeat`,
                width: '4rem',
                height: '4rem',
                borderRadius: '50%'
            }
        }
    },
    methods: {
        onResize(size: { height: number }) {
            if (size.height > 0) {
                this.height = size.height
            }
        }
    }
})
</script>
<style scoped>
.bg-transition {
    transition: background-image 0.3s;
}
.logo {
    opacity: 0.4;
    background: url(~assets/vechain-logo.svg);
    height: 2rem;
    width: 2rem;
}
.index {
    font-size: 4rem;
    font-weight: 100;
    line-height: 100%;
}
</style>
