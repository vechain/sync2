<template>
    <div
        v-scrollDivider.both
        class="overflow-auto"
        :class="{'q-pa-md': padding}"
    >
        <div class="narrow-page q-mx-auto">
            <slot />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        padding: Boolean
    }
})
</script>
