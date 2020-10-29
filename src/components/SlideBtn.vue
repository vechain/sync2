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
                :class="[textClass, {'trs': isTrans}]"
                :style="{opacity: opacity}"
            >
                {{label}}
            </div>
        </div>
        <q-btn
            ref="btn"
            :color="btnColor"
            unelevated
            @transitionend="onTransitionend"
            :class="{'trs': isTrans}"
            round
            :disabled="isTrans || disabled"
            v-touch-pan.prevent.right.mouse="moveFab"
            :style="`transform: translateX(${left})`"
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
            opacity: 1,
            isTrans: false
        }
    },
    mounted() {
        this.height = (this.$refs.btn as Vue).$el.clientHeight
    },
    computed: {
        left(): string {
            return `${this.XOffset}px`
        },
        cHeight(): string {
            return `${this.height}px`
        }
    },
    watch: {
        checked(val: boolean) {
            if (!val) {
                this.XOffset = 0
                this.opacity = 1
            }
        }
    },
    methods: {
        onTransitionend() {
            if (this.isTrans) {
                this.$emit('checked', true)
                this.isTrans = false
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moveFab(details: any) {
            const maxOffset = (this.$refs.container as HTMLDivElement).offsetWidth - (this.$refs.btn as Vue).$el.clientWidth
            if (this.disabled) {
                return
            }
            if (details.distance.x > maxOffset) {
                this.XOffset = maxOffset
            } else {
                this.XOffset = details.distance.x
            }

            if (details.isFinal) {
                if (this.XOffset > maxOffset * 0.85) {
                    this.isTrans = true
                    this.XOffset = maxOffset
                } else {
                    this.XOffset = 0
                }
            }

            this.opacity = this.XOffset === maxOffset ? 0 : (1 - this.XOffset / maxOffset)
        }
    }
})
</script>
<style scoped>
.trs {
    transition: transform 0.1s ease-out, opacity 0.1s ease-out;
}
</style>
