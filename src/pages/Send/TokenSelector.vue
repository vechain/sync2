<template>
    <div>
        <async-resolve
            v-if="token"
            :promise="$svc.bc(token.gid).balanceOf(address, token)"
            v-slot="{data}"
            >
            <TokenItem
                clickable
                :token="token"
                :balance="data"
                :selectIcon="true"
            />
        </async-resolve>
        <pop-sheets
            fit
            :sheets="sheets"
        >
            <template v-slot="{sheet: {model: item}}">
                <async-resolve
                    :key="item.symbol"
                    :promise="$svc.bc(item.gid).balanceOf(address, item)"
                    v-slot="{data}"
                >
                    <TokenItem
                        clickable
                        v-close-popup
                        @click="onSelect(item.symbol)"
                        :balance="data"
                        :token="item"
                    />
                </async-resolve>
            </template>
        </pop-sheets>
    </div>
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
        }
    }
})
</script>
