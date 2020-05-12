<template>
    <div>
        <p>{{ title }}</p>
        <ul>
            <li
                v-for="todo in todos"
                :key="todo.id"
                @click="increment"
            >
                {{ prettyTodo(todo) }}
            </li>
        </ul>
        <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
        <p>Active: {{ active ? 'yes' : 'no' }}</p>
        <p>Clicks on todos: {{ clickCount }}</p>
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
    props: {
        title: { type: String, required: true },
        todos: { type: Array, default: () => [] as M.Todo[] },
        meta: { type: Object as PropType<M.Meta>, required: true },
        active: { type: Boolean }
    },
    data: () => {
        return {
            clickCount: 0
        }
    },
    computed: {
        todoCount() {
            return this.todos.length
        }
    },
    methods: {
        increment() {
            this.clickCount++
        },

        prettyTodo(todo: M.Todo) {
            return `${todo.id} - ${todo.content}`
        }
    }
})
</script>
