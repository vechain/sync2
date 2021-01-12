<template>
    <q-avatar
        v-bind="$attrs"
        color="white"
        class="bordered"
    >
        <q-img
            :src="spec.iconSrc"
            class="fit"
            style="border-radius:inherit"
        />
    </q-avatar>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        spec: Object as () => M.TokenSpec
    }
})
</script>
<style scoped>
.bordered {
    box-sizing: content-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
