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
                v-bind="entryToBinds(entry)"
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
import { newVelometer, newPipeline, transitionEnd } from 'src/utils/transit'

export default Vue.extend({
    data: () => {
        return {
            stack: [] as ScopedEntry[],
            width: 0,
            panning: false,
            transiting: false,
            panRatio: 0,
            transitionMul: 1,
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
        async transit(ratios: { r1?: number, r2?: number, r3?: number }) {
            this.transiting = true
            if (ratios.r1 !== undefined) {
                this.panRatio = ratios.r1
            }
            await this.$nextTick()

            document.body.classList.add('stack-body--prevent-scroll')
            const views = this.animatedViews
            views.forEach(v => v.classList.add('stack-transition'))

            if (ratios.r2 !== undefined) {
                this.panRatio = ratios.r2
            }

            await Promise.all(views.map(v => transitionEnd(v)))

            views.forEach(v => v.classList.remove('stack-transition'))

            document.body.classList.remove('stack-body--prevent-scroll')
            this.transitionMul = 1
            if (ratios.r3 !== undefined) {
                this.panRatio = ratios.r3
            }
            this.transiting = false
        },
        onResize(size: { width: number }) {
            if (size.width > 0) {
                this.width = size.width
            }
        },
        viewClasses(i: number) {
            const classes: Record<string, boolean> = {}
            if (i === this.stack.length - 1) {
                classes['stack-v1'] = true
            } else if (i === this.stack.length - 2) {
                classes['stack-v2'] = true
                classes.invisible = !this.panning && !this.transiting
            } else {
                classes.invisible = true
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

            if (ev.isFinal) {
                this.panning = false
                const v = this.velometer.velocity
                const triggered = (offset > width / 2 && v >= 0) || v > 0.3
                if (triggered) {
                    this.transitionMul = 0.4
                    this.pipeline.run(() => this.transit({ r2: 1, r3: 0 }))
                        .then(() => {
                            this.stack.pop()
                            this.$router.back()
                        })
                } else {
                    this.transitionMul = 0.6
                    this.pipeline.run(() => this.transit({ r2: 0 }))
                }
            } else {
                const ratio = offset / width
                this.panRatio = ratio
            }
            this.velometer.update(ev.duration, ev.delta.x)
        },
        entryToBinds(entry: ScopedEntry) {
            const binds: Record<string, string> = {}
            const varNameRegExp = /^[a-z][a-z0-9]*$/i
            for (const e of Object.entries(entry.query)) {
                if (varNameRegExp.test(e[0])) {
                    binds[e[0]] = e[1].toString()
                }
            }
            for (const e of Object.entries(entry.params)) {
                if (varNameRegExp.test(e[0])) {
                    binds[e[0]] = e[1]
                }
            }
            return binds
        }
    },
    watch: {
        width(newVal: number) {
            (this.$el as HTMLElement).style.setProperty('--stack-container-width', `${newVal}`)
        },
        panRatio(newVal: number) {
            (this.$el as HTMLElement).style.setProperty('--stack-pan-ratio', `${newVal}`)
        },
        transitionMul(newVal: number) {
            (this.$el as HTMLElement).style.setProperty('--stack-transition-mul', `${newVal}`)
        },
        '$stack.scoped'(newVal: ScopedEntry[], oldVal: ScopedEntry[]) {
            // TODO more accurate transition judgement
            this.pipeline.run(async () => {
                if (newVal.length > oldVal.length && newVal.length > 1) {
                    // push in
                    if (newVal[newVal.length - 1].query['no-transition']) {
                        this.stack = newVal
                    } else {
                        this.stack = newVal
                        await this.transit({ r1: 1, r2: 0 })
                    }
                } else if (newVal.length < oldVal.length && newVal.length > 0) {
                    // pop out
                    await this.transit({ r2: 1, r3: 0 })
                    this.stack = newVal
                } else {
                    this.stack = newVal
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
}
.stack-v2 {
    transform: translateX(
        calc(
            var(--stack-container-width) * (var(--stack-pan-ratio) - 1) * 0.3 *
                1px
        )
    );
}
.stack-backdrop {
    background: black;
    opacity: calc((1 - var(--stack-pan-ratio)) * 0.2);
    transform: translateX(
        calc(var(--stack-container-width) * (var(--stack-pan-ratio) - 1) * 1px)
    );
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
</style>
