<template>
    <q-item>
        <q-item-section avatar>
            <q-avatar
                v-if="icon"
                square
            >
                <img :src="icon" />
            </q-avatar>
            <q-avatar
                v-else
                color="primary"
                square
                text-color="white"
            >
                {{token.symbol.slice(0,1)}}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label>
                <span class="text-h5" v-if="balance">{{balance | balance(token.decimals)}}</span>
                <span class="text-h5" v-else> -- </span>
                <span class="text-caption"> {{token.symbol}}</span>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { urls } from 'src/consts'
export default Vue.extend({
    props: {
        token: Object as () => M.TokenSpec,
        balance: String as () => ''
    },
    computed: {
        icon(): string {
            if (this.token.symbol === 'VET') {
                return require('assets/vet.svg')
            } else if (this.token.symbol === 'VTHO') {
                return require('assets/vtho.svg')
            } else if (this.token && this.token.icon) {
                return `${urls.tokenRegistry}assets/${this.token.icon}`
            } else {
                return require('assets/vet.svg')
            }
        }
    }
})
</script>
