<template>
    <q-item>
        <q-item-section avatar>
            <q-item-label caption>
                Est. Fee
            </q-item-label>
        </q-item-section>
        <q-item-section>
            <q-item-label class="row">
                <template v-if="fee">
                    <span>{{fee}}</span>
                    <q-avatar size="xs">
                        <img src="~assets/vtho.svg">
                    </q-avatar>
                </template>
                <q-spinner-dots
                    v-else
                    color="primary"
                />
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

export default Vue.extend({
    props: {
        fee: String
    }
})
</script>
