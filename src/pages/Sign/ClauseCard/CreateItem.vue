<template>
    <q-item>
        <q-item-section avatar>
            <q-item-label class="monospace text-bold">
                <span class="text-primary">new</span> contract() {...}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'

export type OpCreate = {
    type: 'create'
}

export default Vue.extend({
    props: {
        op: Object as () => OpCreate
    }
})
</script>
