<template>
    <q-item
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <q-avatar
                style="box-sizing: content-box; border: 1px solid #E5E5EA"
                size="md"
            >
                <img :src="token.iconSrc" />
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label class="text-body1 ellipsis">
                {{balance | balance(token.decimals)}}
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
export default Vue.extend({
    props: {
        token: Object as () => M.TokenSpec,
        balance: String
    }
})
</script>
