<template>
    <div
        v-bind="$attrs"
        class="relative-position overflow-hidden"
        ref="container"
        :style="{height: cHeight, borderRadius: cHeight}"
    >
        <div
            :class="[{'trs': isTrans}, rClass]"
            class="absolute row items-center justify-center full-width full-height"
        >
            <div
                :class="textClass"
                :style="{opacity: opacity}"
            >
                {{label}}
            </div>
        </div>
        <div
            :class="[{'trs': isTrans}, lClass]"
            @transitionend="isTrans = false"
            class="full-width full-height absolute"
            :style="{right: right, borderRadius: cHeight}"></div>
        <q-btn
            ref="btn"
            :color="btnColor"
            unelevated
            class="absolute"
            :class="{'trs': isTrans}"
            round
            :disabled="isTrans || disabled"
            v-touch-pan.prevent.right.mouse="moveFab"
            :style="{left: left}"
            :icon="btnIcon"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    model: {
        prop: 'checked',
        event: 'checked'
    },
    props: {
        label: String,
        btnIcon: { type: String, default: 'keyboard_arrow_right' },
        lClass: { type: String, default: 'bg-grey-2' },
        rClass: { type: String, default: 'bg-grey-3' },
        btnColor: { type: String, default: 'primary' },
        textClass: { type: String, default: 'text-grey-9' },
        disabled: Boolean,
        checked: Boolean
    },
    data() {
        return {
            XOffset: 0,
            maxOffset: 0,
            height: 0,
            isTrans: false
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
    watch: {
        checked(val: boolean) {
            if (!val) {
                this.XOffset = 0
            }
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
                this.isTrans = true
                if (this.XOffset > this.maxOffset * 0.85) {
                    this.XOffset = this.maxOffset
                    this.$emit('checked', true)
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
    transition: left 0.4s ease-out, right 0.4s ease-out, opacity 0.4s ease-out;
}
</style>
