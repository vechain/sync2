<template>
    <q-expansion-item
        group="token"
        v-bind="$attrs"
        expand-icon-class="hidden"
    >
        <template v-slot:header>
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
                    :value="balance"
                    :decimals="token.decimals"
                > --.-- </amount-label>
            </q-item-section>
        </template>
        <q-item>
            <q-item-section/>
            <q-item-section/>
            <q-item-section
                side
            >
                <div class="q-gutter-md">
                    <slot />
                </div>
            </q-item-section>
        </q-item>
    </q-expansion-item>
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
