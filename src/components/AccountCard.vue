<template>
    <q-card class="bg-yellow">
        <q-card-section>
            Account {{name}}
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        name: String
    }
})

</script>
