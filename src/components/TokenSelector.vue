<template>
    <q-item
        class="q-my-md"
        clickable
    >
        <q-item-section avatar>
            <q-avatar
                v-if="icon"
                square
            >
                <q-img
                    v-if="icon"
                    :src="icon"
                />
            </q-avatar>
            <q-avatar
                v-else
                color="primary"
                text-color="white"
            >
                {{token.symbol.slice(0,1)}}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label>{{token.symbol}}</q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-icon name="unfold_more" />
        </q-item-section>
        <q-popup-proxy
            v-model="showTokenList"
            breakpoint="2000"
            :context-menu="false"
        >
            <q-card class="column full-width no-wrap" >
                <q-toolbar>
                    <q-toolbar-title>Select Token</q-toolbar-title>
                </q-toolbar>
                <q-card-section
                    v-scrollDivider
                    class="col overflow-auto q-pt-none"
                >
                    <BalanceList
                        @select="onSelect"
                        :tokens="tokens"
                        :address="address"
                        :connex="connex"
                        selectabel
                    />
                </q-card-section>
            </q-card>
        </q-popup-proxy>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { tokenSpecs, urls } from '../consts'
export default Vue.extend({
    model: {
        prop: 'symbol',
        event: 'change'
    },
    props: {
        connex: Object as () => Connex,
        address: String,
        tokens: Array as () => M.TokenSpec[],
        symbol: String
    },
    data() {
        return {
            showTokenList: false
        }
    },
    computed: {
        token(): M.TokenSpec | undefined {
            let temp: M.TokenSpec | undefined
            if (this.symbol === 'VET') {
                temp = tokenSpecs.VET
            } else if (this.symbol === 'VTHO') {
                temp = tokenSpecs.VTHO
            } else {
                temp = this.tokens.find(item => item.symbol === this.symbol)
            }
            return temp
        },
        icon(): string {
            if (this.token!.symbol === 'VET') {
                return require('assets/vet.svg')
            } else if (this.token!.symbol === 'VTHO') {
                return require('assets/vtho.svg')
            } else if (this.token && this.token.icon) {
                return `${urls.tokenRegistry}assets/${this.token.icon}`
            } else {
                return require('assets/vet.svg')
            }
        }
    },
    methods: {
        onSelect(symbol: string) {
            this.$emit('change', symbol)
            this.showTokenList = false
        }
    }
})
</script>
