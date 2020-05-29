<template>
    <q-page
        @mousedown.capture="testTouchPan"
        @touchstart.capture="testTouchPan"
        v-touch-pan.right.mouse.prevent="shouldHandlePan? handleTouchPan: undefined"
    >
        <div
            class="absolute-top"
            v-for="(entry, i) in stack"
            v-show="i === stack.length - 1"
            ref="views"
            :key="entry.fullPath"
            :style="{zIndex: i === stack.length - 1 ? 1 : undefined}"
        >
            <component
                :is="entry.component"
                :entry="entry"
            />
        </div>
        <div
            class="absolute-full stack--shade-bg"
            ref="shade"
            v-show="false"
        />
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
import { ScopedEntry } from 'vue-router-stack'
import { transitAdvanced } from 'src/utils/transit'

function newVelometer() {
    let _t1 = 0
    let _t2 = 0
    let _delta = 0
    return {
        update(t: number, delta: number) {
            _t1 = _t2
            _t2 = t
            _delta = delta
        },
        get velocity() {
            return _delta / (_t2 - _t1)
        }
    }
}

export default Vue.extend({
    data: () => {
        return {
            stack: [] as ScopedEntry[],
            velometer: newVelometer(),
            rafId: 0,
            transitionDone: Promise.resolve(),
            shouldHandlePan: false
        }
    },
    created() {
        this.stack = this.$stack.scoped
    },
    methods: {
        async guard(f: () => Promise<unknown>) {
            await this.transitionDone
            this.$el.classList.add('stack--disable-pointer-events')
            this.transitionDone = f().then(() => this.$el.classList.remove('stack--disable-pointer-events'))
            return this.transitionDone
        },
        getViews() {
            const views = this.$refs.views as HTMLElement[]
            return {
                v1: views[views.length - 1],
                v2: views[views.length - 2],
                shade: this.$refs.shade as HTMLElement
            }
        },
        testTouchPan(ev: TouchEvent & MouseEvent) {
            const x = (ev.targetTouches ? ev.targetTouches[0].clientX : ev.clientX) - this.$el.getBoundingClientRect().x
            this.shouldHandlePan = x >= 0 && x < 64 && this.stack.length > 1
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleTouchPan(ev: any) {
            const { v1, v2, shade } = this.getViews()

            const panOffset = Math.max(0, ev.offset.x)
            const ratio = Math.min(1, panOffset / v1.clientWidth)

            if (this.rafId) {
                cancelAnimationFrame(this.rafId)
            }

            if (!ev.isFirst && !ev.isFinal) {
                this.rafId = requestAnimationFrame(() => {
                    v1.style.transform = `translate(${panOffset}px)`
                    v2.style.transform = `translate(calc(var(--stack-v2-offset)*${(1 - ratio)}))`
                    shade.style.opacity = `${1 - ratio}`
                    this.rafId = 0
                })
            }

            if (ev.isFirst) {
                v1.__transitionFinalize = () => {
                    v1.style.transform = ''
                    v1.style.transition = ''
                }

                v2.classList.add('stack--show-important')
                v2.__transitionFinalize = () => {
                    v2.classList.remove('stack--show-important')
                    v2.style.transform = ''
                    v2.style.transition = ''
                }

                shade.classList.add('stack--show-important')
                shade.__transitionFinalize = () => {
                    shade.style.opacity = ''
                    shade.style.transition = ''
                    shade.classList.remove('stack--show-important')
                }
            }

            if (ev.isFinal) {
                const v = this.velometer.velocity
                if ((panOffset > v1.clientWidth / 2 && v >= 0) || v > 0.3) {
                    v1.style.transition =
                        v2.style.transition =
                        shade.style.transition = 'var(--stack-transition-short)'
                    this.$router.go(-1)
                } else {
                    this.guard(async () => {
                        v1.style.transition =
                            v2.style.transition =
                            shade.style.transition = 'var(--stack-transition-short)'

                        const ts = [
                            transitAdvanced(v1, {
                                to: 'stack--v1-in-important'
                            }),
                            transitAdvanced(shade, {
                                to: 'stack--shade-mask-important'
                            })
                        ]

                        if (v2) {
                            ts.push(transitAdvanced(v2, {
                                to: 'stack--v2-out-important'
                            }))
                        }
                        (await Promise.all(ts)).forEach(f => f())
                    })
                }
            }

            this.velometer.update(ev.duration, ev.delta.x)
        }
    },
    watch: {
        '$stack.scoped'(newVal: ScopedEntry[], oldVal: ScopedEntry[]) {
            this.guard(async () => {
                // TODO more accurate transition judgement
                if (newVal.length > oldVal.length && newVal.length > 1) {
                    // push in
                    this.stack = newVal
                    await this.$nextTick()
                    const { v1, v2, shade } = this.getViews();
                    (await Promise.all([
                        transitAdvanced(v1, {
                            from: 'stack--v1-out',
                            to: 'stack--v1-in-important',
                            active: 'stack--transition'
                        }),
                        transitAdvanced(v2, {
                            to: 'stack--v2-out-important',
                            active: 'stack--transition,stack--show-important'
                        }),
                        transitAdvanced(shade, {
                            from: 'stack--shade-clear',
                            to: 'stack--shade-mask-important',
                            active: 'stack--transition,stack--show-important'
                        })
                    ])).forEach(f => f())
                } else if (newVal.length < oldVal.length && newVal.length > 0) {
                    // pop out
                    const { v1, v2, shade } = this.getViews();
                    (await Promise.all([
                        transitAdvanced(v1, {
                            to: 'stack--v1-out-important',
                            active: 'stack--transition'
                        }),
                        transitAdvanced(v2, {
                            from: 'stack--v2-out',
                            to: 'stack--v2-in-important',
                            active: 'stack--transition,stack--show-important'
                        }),
                        transitAdvanced(shade, {
                            to: 'stack--shade-clear-important',
                            active: 'stack--transition,stack--show-important'
                        })
                    ])).forEach(f => f())
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
    --stack-transition: all 0.35s;
    --stack-transition-short: all 0.2s;
    --stack-v2-offset: -20%;
}
.stack--transition {
    transition: var(--stack-transition);
}
.stack--v1-out {
    transform: translate(100%);
}
.stack--v1-out-important {
    transform: translate(100%) !important;
}
.stack--v1-in-important {
    transform: translate(0px) !important;
}
.stack--v2-out {
    transform: translate(var(--stack-v2-offset));
}
.stack--v2-out-important {
    transform: translate(var(--stack-v2-offset)) !important;
}
.stack--v2-in-important {
    transform: translate(0px) !important;
}
.stack--show-important {
    display: block !important;
}
.stack--disable-pointer-events,
.stack--disable-pointer-events * {
    pointer-events: none !important;
}
.stack--shade-clear {
    opacity: 0;
}
.stack--shade-clear-important {
    opacity: 0 !important;
}
.stack--shade-mask-important {
    opacity: 1 !important;
}
.stack--shade-bg {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>
