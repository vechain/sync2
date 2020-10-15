<template>
    <fragment>
        <Item v-for="a in activities" :key="a.id" :item="a" />
    </fragment>
</template>
<script lang="ts">
import Vue from 'vue'
import Item from './Item.vue'

export default Vue.extend({
    components: {
        Item
    },
    computed: {
        activities() {
            return this.$state.activity.list.filter(item => {
                return !item.glob.closed && item.glob.type === 'tx'
            })
        }
    }
})
</script>
