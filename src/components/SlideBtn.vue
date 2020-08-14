<template>
    <div
        v-bind="$attrs"
        class="relative-position overflow-hidden"
        ref="container"
        :style="{height: cHeight, borderRadius: cHeight}"
    >
        <div
            :class="rClass"
            class="absolute row items-center justify-center full-width full-height"
        >
            <div
                :class="textClass"
                class="trs"
                :style="{opacity: opacity}"
            >
                {{label}}
            </div>
        </div>
        <div
            :class="lClass"
            class="trs full-width full-height absolute"
            :style="{right: right, borderRadius: cHeight}"></div>
        <q-btn
            ref="btn"
            :color="btnClass"
            unelevated
            class="trs absolute"
            round
            v-touch-pan.prevent.right.mouse="moveFab"
            :style="{left: left}"
            :icon="btnIcon"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        label: String,
        btnIcon: { type: String, default: 'keyboard_arrow_right' },
        lClass: { type: String, default: 'bg-grey-2' },
        rClass: { type: String, default: 'bg-grey-3' },
        btnClass: { type: String, default: 'primary' },
        textClass: { type: String, default: 'text-grey-9' }
    },
    data() {
        return {
            XOffset: 0,
            maxOffset: 0,
            disabled: false,
            height: 0
        }
    },
    mounted() {
        const c = this.$refs.container as HTMLDivElement
        const b = this.$refs.btn as Vue
        this.height = b.$el.clientHeight
        this.maxOffset = c.offsetWidth - b.$el.clientWidth
    },
    computed: {
        left(): string {
            return `${this.XOffset}px`
        },
        right(): string {
            return `${this.maxOffset - this.XOffset}px`
        },
        opacity(): number {
            return this.XOffset === this.maxOffset ? 0 : (1 - this.XOffset / this.maxOffset)
        },
        cHeight(): string {
            return `${this.height}px`
        }
    },
    methods: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moveFab(details: any) {
            if (this.disabled) {
                return
            }
            if (details.distance.x > this.maxOffset) {
                this.XOffset = this.maxOffset
            } else {
                this.XOffset = details.distance.x
            }

            if (details.isFinal) {
                if (this.XOffset > this.maxOffset * 0.75) {
                    this.XOffset = this.maxOffset
                    this.disabled = true
                    this.$emit('checked')
                } else {
                    this.XOffset = 0
                }
            }
        }
    }
})
</script>
<style scoped>
.trs {
    transition: position opacity 0.6s ease-in-out;
}
</style>
