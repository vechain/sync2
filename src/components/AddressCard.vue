<template>
    <q-card
        :style="{...background}"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <ConnexContinuous
            :connex="connex"
            :query="()=> connex.thor.account(address).get()"
            v-slot="{data}"
        >
            <q-card-section class="text-white column no-wrap full-height">
                <!-- logo -->
                <img
                    src="~assets/vechain-logo.svg"
                    class="logo absolute-bottom-right"
                    :width="height*0.8"
                    :height="height*0.8"
                >
                <!-- balances -->
                <div class="text-right">
                    <span class="text-h6 text-weight-regular">{{data?data.balance:null | balance}}</span>
                    <span class="monospace text-caption"> VET&nbsp;</span></div>
                <div class="text-right">
                    <span class="text-h6 text-weight-regular">{{data?data.energy:null | balance}}</span>
                    <span class="monospace text-caption"> VTHO</span>
                </div>
                <q-space />
                <!-- address -->
                <div>
                    <span class="text-h2 text-weight-thin">{{index+1}} </span>
                    <span class="monospace text-overline">{{address | checksum | abbrev(8,6)}}</span>
                </div>
            </q-card-section>
        </ConnexContinuous>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'

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
        svg() {
            return picasso(this.address)
        },
        background(): object {
            const backgrounds = [
                'linear-gradient(160deg, grey 0%, black 100%)',
                `url('data:image/svg+xml;utf8,${this.svg}')`
            ]
            return {
                background: backgrounds.join(','),
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundBlendMode: 'soft-light'
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
.logo {
    opacity: 0.12;
    margin-right: -3%;
    margin-bottom: -9%;
}
</style>
