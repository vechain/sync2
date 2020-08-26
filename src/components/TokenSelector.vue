<template>
    <q-item
        class="q-my-md"
        clickable
    >
        <q-item-section avatar>
            <q-avatar
                color="primary"
                text-color="white"
            >
                {{token.symbol.slice(0,1)}}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label lines="1">{{token.symbol}}</q-item-label>
            <q-item-label
                caption
                lines="2"
            >
                {{token.name}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-icon name="unfold_more" />
        </q-item-section>
        <q-popup-proxy v-model="showTokenList" full-width>
            <q-card>
                <q-card-section style="max-height: 70vh" class="scroll">
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
import { tokenSpecs } from '../consts'
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
