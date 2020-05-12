<template>
    <q-page class="row items-center justify-evenly">
        <class-component
            title="Example component"
            active
            :todos="todos"
            :meta="meta"
        ></class-component>
    </q-page>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data: () => {
        return {
            todos: [
                {
                    id: 1,
                    content: 'ct1'
                },
                {
                    id: 2,
                    content: 'ct2'
                },
                {
                    id: 3,
                    content: 'ct3'
                },
                {
                    id: 4,
                    content: 'ct4'
                },
                {
                    id: 5,
                    content: 'ct5'
                }
            ],
            meta: {
                totalCount: 1200
            }
        }
    }
})
</script>
