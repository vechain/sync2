<template>
    <q-card class="bg-yellow">
        <q-card-section>
            Account {{addressItem.index}}
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        addressItem: Object as () => M.Wallet.Meta['addresses'][0]
    }
})

</script>
