<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <token-avatar size="xl" :spec="token"/>
        </q-item-section>
        <q-item-section>
            <slot />
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
        token: Object as () => M.TokenSpec
    }
})
</script>
