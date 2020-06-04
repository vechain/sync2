<template>
    <q-list>
        <template v-for="(item, i) in list">
            <q-item :key="item.address">
                <q-item-section avatar>
                    <q-avatar>
                        <img src="https://cdn.quasar.dev/img/avatar2.jpg">
                    </q-avatar>
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
                    {{ balances ? balances[item.symbol] === undefined ? '--' : balances[item.symbol].toLocaleString() : '--'}}
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
        balances: Object as () => { [k: string]: number }[]
    }
})
</script>
