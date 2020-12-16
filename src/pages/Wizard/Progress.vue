<template>
    <transition-group
        tag="div"
        name="q-transition--jump-down"
        class="column q-gutter-y-md"
    >
        <div
            v-for="(_, i) in history"
            class="text-h5"
            :class="getClass(i)"
            :key="i+''"
        >
            {{getContent(i)}}
        </div>
    </transition-group>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        current: String
    },
    data() {
        return {
            history: [] as string[]
        }
    },
    watch: {
        current(newVal: string) {
            this.history.push(newVal)
        }
    },
    methods: {
        getClass(i: number) {
            return i + 1 === this.history.length ? 'text-dark' : 'text-grey'
        },
        getContent(i: number) {
            const str = this.history[i]
            if (str) {
                return i + 1 === this.history.length ? str + '...' : str
            }
            return ''
        }
    }
})
</script>
