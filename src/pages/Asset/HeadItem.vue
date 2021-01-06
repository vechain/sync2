<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <token-avatar size="md" :spec="token"/>
        </q-item-section>
        <q-item-section>
            <q-item-label class="text-body1">
                <amount-label :value="balance" :decimals="token.decimals" />
            </q-item-label>
            <q-item-label
                class="text-body2 text-grey"
                lines="2"
            >
                {{token.name}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <slot />
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
        balance: String
    }
})
</script>
