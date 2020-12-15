<template>
    <transition-group
        v-bind="$attrs"
        tag="div"
    >
        <div
            v-for="(str, i) in steps"
            class="text-h5 q-mb-lg"
            :class="steps.length === i+1 ? 'text-dark' : 'text-grey'"
            :key="`${i}`"
        >
            {{str}}
        </div>
        <div
            :key="sentences.length"
            v-if="done"
            class="text-center"
        >
            <slot />
        </div>
    </transition-group>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        sentences: {
            type: Array as () => string[],
            default: () => []
        }
    },
    data() {
        return {
            steps: [] as string[],
            done: false
        }
    },
    computed: {
        isDone(): boolean {
            return this.steps.length === this.sentences.length
        }
    },
    mounted() {
        this.start()
    },
    methods: {
        async start() {
            for (let i = 0; i < this.sentences.length; i++) {
                this.steps.push(this.sentences[i])
                this.isDone && this.$emit('done')
                await new Promise(resolve => setTimeout(resolve, this.isDone ? 300 : 1000))
                this.done = this.isDone
            }
        }
    }
})
</script>
