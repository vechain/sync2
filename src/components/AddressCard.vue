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
        addressItem: Object // M.Wallet.Meta[addresses][item]
    }
})

</script>
