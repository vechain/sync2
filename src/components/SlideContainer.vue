<template>
    <div
        class="row no-wrap slide-container overflow-scroll"
        @scroll="onScrolled"
        ref="container"
    >
        <div
            class="slide-item col-12"
            v-for="(_, i) in count"
            :key="i"
        >
            <slot
                :index="i"
                :active="isActive(i)"
            />
        </div>
        <q-resize-observer
            @resize="onResize"
            :debounce="0"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

/* example:
<slide-container :count="5" v-model="current" v-slot="{index, active}">
  <div v-if="active">
    Slide {{index}}
  </div>
</slide-container>
*/
export default Vue.extend({
    props: {
        value: Number,
        count: Number
    },
    data: () => {
        return { current: 0 }
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    watch: {
        current(newVal: number) {
            if (this.value !== newVal) {
                this.$emit('input', newVal)
            }
        },
        value(newVal: number) {
            if (newVal !== this.current) {
                const smooth = Math.abs(newVal - this.current) === 1
                this.scrollTo(newVal, smooth)
            }
        }
    },
    methods: {
        onScrolled() {
            const container = this.$refs.container as HTMLElement
            const mul = container.scrollLeft / container.scrollWidth * this.count
            if (Math.abs(mul - this.current) > 0.8) {
                this.current = Math.round(mul)
            }
        },
        onResize() {
            this.scrollTo(this.current, false)
        },
        isActive(i: number) {
            return [i, i - 1, i + 1].includes(this.current)
        },
        scrollTo(i: number, smooth: boolean) {
            const container = this.$refs.container as HTMLElement
            const x = Math.ceil(i * container.scrollWidth / this.count)
            container.scrollTo({ left: x, behavior: smooth ? 'smooth' : undefined })
        }
    },
    mounted() {
        this.scrollTo(this.value, false)
    }
})
</script>
<style scoped>
.slide-container {
    scroll-snap-type: x mandatory;
    overflow-x: scroll;
}
.slide-item {
    scroll-snap-align: start;
    scroll-snap-stop: always;
}
</style>
