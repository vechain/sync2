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
        <q-item-section v-if="!selectIcon"></q-item-section>
        <q-item-section :side="!selectIcon" class="text-dark">
            <q-item-label>
                <amount-label v-if="balance" :value="balance" :decimals="token.decimals"/>
                <template v-else> -- </template>
            </q-item-label>
            <q-item-label caption>{{token.symbol}}</q-item-label>
        </q-item-section>
        <q-item-section
            v-if="selectIcon"
            side
        >
            <q-icon name="unfold_more" />
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
        balance: String,
        selectIcon: Boolean
    }
})
</script>
