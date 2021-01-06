<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
        clickable
    >
        <q-item-section avatar>
            <token-avatar
                size="md"
                :spec="token"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{token.symbol}}</q-item-label>
        </q-item-section>
        <q-item-section
            side
            class="text-dark"
        >
            <amount-label
                v-if="balance"
                :value="balance"
                :decimals="token.decimals"
            />
            <template v-else> -- </template>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenAvatar from 'components/TokenAvatar.vue'
import AmountLabel from 'components/AmountLabel.vue'

export default Vue.extend({
    components: {
        TokenAvatar,
        AmountLabel
    },
    props: {
        token: Object as () => M.TokenSpec,
        balance: String as () => ''
    }
})
</script>
