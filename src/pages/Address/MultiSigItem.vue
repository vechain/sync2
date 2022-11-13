<template>
    <q-expansion-item
        group="token"
        v-bind="$attrs"
        expand-icon-class="hidden"
    >
        <template v-slot:header>
            <q-item-section>
                <q-item-label>{{$t('address.label_transactions')}}</q-item-label>
            </q-item-section>
            <q-item-section
                side
                class="text-dark"
            >
                <amount-label
                    :value="transactions"
                    :decimals="0"
                    :fixed="0"
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
import AmountLabel from 'components/AmountLabel.vue'

export default Vue.extend({
    components: {
        AmountLabel
    },
    props: {
        transactions: String as () => ''
    }
})
</script>
