<template>
    <fragment>
        <entry
            v-for="item in uncompleted"
            :key="item.id"
            :activity="item"
        />
    </fragment>
</template>
<script lang="ts">
import Vue from 'vue'
import Entry from './Entry'

export default Vue.extend({
    components: { Entry },
    asyncComputed: {
        uncompleted(): Promise<M.Activity[]> {
            return this.$svc.activity.uncompleted()
                .then(r => r.filter(i => i.type === 'tx'))
        }
    }
})
</script>
