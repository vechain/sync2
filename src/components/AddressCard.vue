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
                    class="brand-icon q-mb-sm"
                    width="48"
                    height="48"
                >
                <!-- address -->
                <span class="monospace text-h6"> {{address | checksum | abbrev(8,6)}}</span>
                <q-space />
                <!-- balances -->
                <div class="text-right">
                    <span class="serif text-h6">{{data?data.balance:null | balance}}</span>
                    <span class="monospace text-caption q-ml-sm">VET&nbsp;</span></div>
                <div class="text-right">
                    <span class="serif text-h6">{{data?data.energy:null | balance}}</span>
                    <span class="monospace text-caption q-ml-sm">VTHO</span>
                </div>
            </q-card-section>
        </ConnexContinuous>
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
    }
})
</script>
<style scoped>
.brand-icon {
    opacity: 0.7;
}
</style>
