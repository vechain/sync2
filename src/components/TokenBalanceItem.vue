<template>
    <q-item
        :dense="dense"
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <q-avatar
                v-if="icon"
                style="box-sizing: content-box; border: 1px solid #E5E5EA"
                :size="dense ? 'sm' : 'md'"
            >
                <img :src="icon" />
            </q-avatar>
            <q-avatar
                v-else
                :size="dense ? 'sm' : 'md'"
                color="primary"
                rounded
                text-color="white"
            >
                {{token.symbol.slice(0,1)}}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label :class="{'text-body2': dense}">{{token.symbol}}</q-item-label>
        </q-item-section>
        <q-item-section
            side
            class="text-dark"
        >
            <span v-if="balance">{{balance | balance(token.decimals)}}</span>
            <span v-else> -- </span>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { urls } from 'src/consts'
export default Vue.extend({
    props: {
        token: Object as () => M.TokenSpec,
        balance: String as () => '',
        dense: { type: Boolean, default: false }
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
