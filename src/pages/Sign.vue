<template>
    <div class="bg-white fit">
        This is the entry page for external signing request in SPA mode
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        rid: String, // the request id
        net: String
    },
    async mounted() {
        try {
            await this.$sign()
        } finally {
            this.$router.back()
        }
    }
})
</script>
