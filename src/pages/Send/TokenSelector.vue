<template>
    <q-item
        class="q-my-md"
        clickable
    >
        <template v-if="token">
            <q-item-section avatar>
                <q-avatar square>
                    <q-img :src="token.iconSrc" />
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>{{token.symbol}}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon name="unfold_more" />
            </q-item-section>
        </template>
        <pop-sheets
            fit
            :sheets="sheets"
        >
            <template v-slot="{sheet: {model: token}}">
                <async-resolve
                    :key="token.symbol"
                    :promise="$svc.bc(token.gid).balanceOf(address, token)"
                    v-slot="{data}"
                >
                    <TokenItem
                        clickable
                        v-close-popup
                        @click="onSelect(token.symbol)"
                        :balance="data"
                        :token="token"
                    />
                </async-resolve>
            </template>
        </pop-sheets>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'
import AsyncResolve from 'components/AsyncResolve'

export default Vue.extend({
    components: {
        TokenItem,
        PopSheets,
        AsyncResolve
    },
    model: {
        prop: 'symbol',
        event: 'change'
    },
    props: {
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
        token() {
            return this.tokens.find(t => t.symbol === this.symbol)
        },
        sheets(): Sheet<M.TokenSpec>[] {
            return this.tokens.map<Sheet<M.TokenSpec>>((t: M.TokenSpec) => {
                return {
                    model: t,
                    label: '',
                    action: () => { }
                }
            })
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
