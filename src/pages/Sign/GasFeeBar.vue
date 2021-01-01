<template>
    <q-item>
        <q-item-section avatar>
            <q-item-label caption>Est. Fee</q-item-label>
        </q-item-section>
        <q-item-section>
            <q-item-label>
                <amount-label
                    v-if="fee"
                    :value="fee"
                    :decimals="18"
                />
                <q-spinner-dots
                    v-else
                    color="primary"
                />
                <q-avatar size="1em">
                    <img src="~assets/vtho.svg">
                </q-avatar>
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-item-label>
                <slot />
            </q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AmountLabel from 'src/components/AmountLabel.vue'

export default Vue.extend({
    components: { AmountLabel },
    props: {
        fee: String
    }
})
</script>
