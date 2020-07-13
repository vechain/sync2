<template>
    <q-item v-on="$listeners" v-bind="$attrs">
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
            <span v-if="balance">{{balance | balance(token.decimals)}}</span>
            <span v-else> -- </span>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        token: Object as () => { symbol: string, name: string, decimals: number },
        balance: String as () => ''
    }
})
</script>
