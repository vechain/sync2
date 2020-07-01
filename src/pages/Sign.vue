<template>
    <div>
        This is the entry page for external signing request in SPA mode
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        rid: String // the request id
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
