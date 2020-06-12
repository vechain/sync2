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
            <q-card-section class="text-white">
                <div> #{{index}}</div>
                <div class="ellipsis"> {{address}}</div>
                {{data}}
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
        background() {
            const svg = picasso(this.address)
            const backgrounds = [
                'radial-gradient(circle, grey 0%, black 100%)',
                `url('data:image/svg+xml;utf8,${svg}')`
            ]
            return {
                background: backgrounds.join(','),
                backgroundSize: 'cover',
                backgroundBlendMode: 'soft-light',
                borderRadius: '16px'
            }
        }
    }
})
</script>
