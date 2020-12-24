<template>
    <q-avatar
        v-bind="$attrs"
        class="bg-white bordered"
    >
        <q-img :src="spec.iconSrc" />
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
