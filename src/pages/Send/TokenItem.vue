<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
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
            v-if="selectIcon"
            side
        >
            <q-icon name="unfold_more" />
        </q-item-section>
        <q-item-section
            side
            v-else
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
        selectIcon: Boolean
    }
})
</script>
