<template>
    <q-item>
        <q-item-section avatar>
            <q-avatar square>
                <img :src="token.iconSrc" />
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label>
                <span
                    class="text-h5"
                    v-if="balance"
                >{{balance | balance(token.decimals)}}</span>
                <span
                    class="text-h5"
                    v-else
                > -- </span>
                <span class="text-caption"> {{token.symbol}}</span>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    name: 'TokenBalance',
    props: {
        token: Object as () => M.TokenSpec,
        balance: String
    }
})
</script>
