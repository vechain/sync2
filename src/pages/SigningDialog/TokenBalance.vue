<template>
    <q-item>
        <q-item-section avatar>
            <token-avatar :spec="token"/>
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
import TokenAvatar from 'components/TokenAvatar.vue'

export default Vue.extend({
    name: 'TokenBalance',
    components: {
        TokenAvatar
    },
    props: {
        token: Object as () => M.TokenSpec,
        balance: String
    }
})
</script>
