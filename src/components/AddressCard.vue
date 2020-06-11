<template>
    <q-card
        :style="{...background}"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-card-section class="text-white">
            <div> #{{index}}</div>
            <div class="ellipsis"> {{address}}</div>
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'

export default Vue.extend({
    props: {
        address: String,
        index: Number
    },
    computed: {
        background() {
            const svg = picasso(this.address)
            return {
                'background-image': `url('data:image/svg+xml;utf8,${svg}')`,
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
                'border-radius': '16px'
            }
        }
    }
})
</script>
