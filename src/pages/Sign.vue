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
            // const result =
            await this.$signTx({ message: [] })
        } finally {
            this.$router.back()
        }
    }
})
</script>
