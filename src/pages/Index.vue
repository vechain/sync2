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
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Index extends Vue {
    todos: M.Todo[] = [
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
    ]

    meta: M.Meta = {
        totalCount: 1200
    }
}
</script>
