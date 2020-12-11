<template>
    <q-item
        :dense="dense"
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <q-avatar
                style="box-sizing: content-box; border: 1px solid #E5E5EA"
                :size="dense ? 'sm' : 'md'"
            >
                <img :src="token.iconSrc" />
            </q-avatar>
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

export default Vue.extend({
    props: {
        token: Object as () => M.TokenSpec,
        balance: String,
        dense: { type: Boolean, default: false }
    }
})
</script>
