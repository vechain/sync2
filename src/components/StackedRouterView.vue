<template>
    <q-page
        @mousedown.capture="testTouchPan"
        @touchstart.capture="testTouchPan"
        v-touch-pan.right.mouse.prevent="shouldHandlePan? handleTouchPan: undefined"
        :class="{'stack--disable-pointer-events': transiting}"
    >
        <div
            ref="views"
            v-for="(entry, i) in stack"
            :key="entry.fullPath"
            class="absolute-full"
            :class="viewClasses(i)"
        >
            <component
                :is="entry.component"
                :stacked-full-path="entry.fullPath"
            />
        </div>
        <div
            ref="backdrop"
            class="absolute-full stack-backdrop"
            v-show="panning||transiting"
        />
        <q-resize-observer @resize="onResize" />
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
import { ScopedEntry } from 'vue-router-stack'
import { newVelometer, newPipeline, nextFrame, transitionEnd } from 'src/utils/transit'

export default Vue.extend({
    data: () => {
        return {
            stack: [] as ScopedEntry[],
            width: 0,
            panning: false,
            transiting: false,
            shouldHandlePan: false,
            velometer: newVelometer(),
            pipeline: newPipeline(),
            touchPanInitOffset: 0
        }
    },
    computed: {
        animatedViews() {
            // eslint-disable-next-line no-unused-expressions
            this.stack // make reactive
            const views = this.$refs.views as HTMLElement[]
            return [
                views[views.length - 1],
                views[views.length - 2],
                this.$refs.backdrop as HTMLElement
            ]
        }
    },
    created() {
        this.stack = this.$stack.scoped
    },
    methods: {
        setPanRatio(ratio: number) {
            (this.$el as HTMLElement).style.setProperty('--stack-pan-ratio', `${ratio}`)
        },
        setTransitionDurationMul(m: number) {
            (this.$el as HTMLElement).style.setProperty('--stack-transition-mul', `${m}`)
        },
        async transit(pushIn: boolean) {
            this.transiting = true
            document.body.classList.add('stack-body--prevent-scroll')

            await nextFrame()

            const views = this.animatedViews
            views.forEach(v => v.classList.add('stack-transition'))

            await nextFrame()

            this.setPanRatio(pushIn ? 0 : 1)

            await Promise.all(views.map(v => transitionEnd(v)))

            views.forEach(v => v.classList.remove('stack-transition'))

            document.body.classList.remove('stack-body--prevent-scroll')
            this.setTransitionDurationMul(1)
            this.transiting = false
        },
        onResize(size: { width: number }) {
            if (size.width > 0) {
                (this.$el as HTMLElement).style.setProperty('--stack-container-width', `${size.width}`)
                this.width = size.width
            }
        },
        viewClasses(i: number) {
            const classes: Record<string, boolean> = {}
            if (i === this.stack.length - 1) {
                classes['stack-v1'] = true
                classes['overflow-auto'] = true
            } else if (i === this.stack.length - 2) {
                classes['stack-v2'] = true
                classes['stack-display-none'] = !this.panning && !this.transiting
                classes['overflow-hidden'] = true
            } else {
                classes['stack-display-none'] = true
                classes['overflow-hidden'] = true
            }
            return classes
        },
        testTouchPan(ev: TouchEvent & MouseEvent) {
            const x = (ev.targetTouches ? ev.targetTouches[0].clientX : ev.clientX) - this.$el.getBoundingClientRect().x
            this.shouldHandlePan = x >= 0 && x < 64 && this.stack.length > 1
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleTouchPan(ev: any) {
            if (ev.isFirst) {
                document.body.classList.add('stack-body--prevent-scroll')
                this.panning = true
                this.touchPanInitOffset = ev.offset.x
            }

            const offset = Math.max(0, ev.offset.x - this.touchPanInitOffset)
            const width = Math.max(1, this.width)

            const ratio = offset / width
            this.setPanRatio(ratio)

            if (ev.isFinal) {
                this.panning = false
                const v = this.velometer.velocity
                const triggered = (offset > width / 2 && v >= 0) || v > 0.3
                if (triggered) {
                    this.setTransitionDurationMul(0.4)
                    this.$router.go(-1)
                    this.transiting = true
                } else {
                    this.setTransitionDurationMul(0.6)
                    this.pipeline.run(() => this.transit(true))
                }
            }
            this.velometer.update(ev.duration, ev.delta.x)
        }
    },
    watch: {
        '$stack.scoped'(newVal: ScopedEntry[], oldVal: ScopedEntry[]) {
            // TODO more accurate transition judgement
            this.pipeline.run(async () => {
                if (newVal.length > oldVal.length && newVal.length > 1) {
                    // push in
                    if (newVal[newVal.length - 1].query['no-transition']) {
                        this.stack = newVal
                    } else {
                        this.transiting = true
                        this.setPanRatio(1)
                        this.stack = newVal

                        await this.$nextTick()
                        await this.transit(true)
                    }
                } else if (newVal.length < oldVal.length && newVal.length > 0) {
                    // pop out
                    await this.transit(false)
                    this.stack = newVal
                    this.setPanRatio(0)
                    await this.$nextTick()
                } else {
                    this.stack = newVal
                    await this.$nextTick()
                }
            })
        }
    }
})
</script>
<style >
:root {
    --stack-pan-ratio: 0;
    --stack-container-width: 0;
    --stack-transition-mul: 1;
}

.stack-v1 {
    transform: translateX(
        calc(var(--stack-container-width) * var(--stack-pan-ratio) * 1px)
    );
    z-index: 1;
}
.stack-v2 {
    transform: translateX(
        calc(
            var(--stack-container-width) * (var(--stack-pan-ratio) - 1) * 0.2 *
                1px
        )
    );
}
.stack-backdrop {
    background: black;
    opacity: calc((1 - var(--stack-pan-ratio)) * 0.1);
}
.stack-transition {
    transition: all calc(0.35s * var(--stack-transition-mul));
}
.stack-body--prevent-scroll {
    position: fixed !important;
}
.stack--disable-pointer-events,
.stack--disable-pointer-events * {
    pointer-events: none !important;
}
.stack-display-none {
    display: none;
}
</style>
