<template>
    <q-item
        :dense="dense"
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <token-avatar size="md" :spec="token"/>
        </q-item-section>
        <q-item-section>
            <q-item-label :class="{'text-body2': dense}">{{token.symbol}}</q-item-label>
        </q-item-section>
        <q-item-section
            side
            class="text-dark"
        >
            <span v-if="balance">{{balance | balance(token.decimals)}}</span>
            <span v-else> -- </span>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenAvatar from 'components/TokenAvatar.vue'

export default Vue.extend({
    components: {
        TokenAvatar
    },
    props: {
        token: Object as () => M.TokenSpec,
        balance: String,
        dense: { type: Boolean, default: false }
    }
})
</script>
