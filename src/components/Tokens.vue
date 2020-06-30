<template>
    <q-list>
        <template v-for="(item, i) in list">
            <q-item :key="item.address">
                <q-item-section avatar>
                    <q-avatar
                        color="primary"
                        text-color="white"
                    >{{item.symbol.slice(0,1)}}</q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label lines="1">{{item.symbol}}</q-item-label>
                    <q-item-label
                        caption
                        lines="2"
                    >
                        {{item.name}}
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <span v-if="balances && balances[item.symbol]">
                        {{ balances[item.symbol].balance | balance(balances[item.symbol].decimals) }}
                    </span>
                    <span v-else>--</span>
                </q-item-section>
            </q-item>
            <q-separator
                v-if="i !== list.length - 1"
                :key="i + 's'"
                inset="item"
            />
        </template>
    </q-list>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        list: Array as () => { name: string, symbol: string }[],
        balances: Object as () => { [k: string]: M.TokenBaseInfo }[]
    }
})
</script>
