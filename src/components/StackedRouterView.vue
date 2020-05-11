<template>
    <q-page
        @mousedown.capture="testTouchPan"
        @touchstart.capture="testTouchPan"
        v-touch-pan.right.mouse.prevent="onTouchPan"
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
            class="absolute-full srv--shade-bg"
            ref="shade"
            v-show="false"
        />
    </q-page>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ScopedEntry } from 'vue-router-stack'
import { transit } from 'core/utils'

@Component
export default class StackedRouterView extends Vue {
    stack = this.$stack.scoped
    transitionDone: unknown

    // guard the transition process by disable pointer events
    async guard(f: () => Promise<unknown>) {
        await this.transitionDone
        this.$el.classList.add('srv--disable-pointer-events')
        this.transitionDone = f().then(() => this.$el.classList.remove('srv--disable-pointer-events'))
        return this.transitionDone
    }

    getViews() {
        const views = this.$refs.views as HTMLElement[]
        return {
            v1: views[views.length - 1],
            v2: views[views.length - 2],
            shade: this.$refs.shade as HTMLElement
        }
    }

    @Watch('$stack.scoped')
    stackChanged(newVal: ScopedEntry[], oldVal: ScopedEntry[]) {
        this.guard(async () => {
            // TODO more accurate transition judgement
            if (newVal.length > oldVal.length) {
                // push in
                this.stack = newVal
                await this.$nextTick()
                const { v1, v2, shade } = this.getViews()
                await Promise.all([
                    transit(v1, {
                        from: 'srv--v1-out',
                        to: 'srv--v1-in-enforce',
                        active: 'srv--transition-ease-out'
                    }),
                    transit(v2, {
                        to: 'srv--v2-out-enforce',
                        active: 'srv--transition,srv--show-enforce'
                    }),
                    transit(shade, {
                        from: 'srv--shade-transparent',
                        to: 'srv--shade-opaque-enforce',
                        active: 'srv--transition,srv--show-enforce'
                    })
                ])
            } else if (newVal.length < oldVal.length) {
                // pop out
                const { v1, v2, shade } = this.getViews()
                await Promise.all([
                    transit(v1, {
                        to: 'srv--v1-out-enforce',
                        active: 'srv--transition'
                    }),
                    transit(v2, {
                        from: 'srv--v2-out',
                        to: 'srv--v2-in-enforce',
                        active: 'srv--transition,srv--show-enforce'
                    }),
                    transit(shade, {
                        to: 'srv--shade-transparent-enforce',
                        active: 'srv--transition,srv--show-enforce'
                    })
                ])
                this.stack = newVal
            } else {
                this.stack = newVal
            }
        })
    }

    velocity = {
        t1: 0,
        t2: 0,
        d: 0,
        update(t: number, d: number) {
            this.t1 = this.t2
            this.t2 = t
            this.d = d
        },
        get v() {
            return this.d / (this.t2 - this.t1)
        }
    }

    testTouchPan(ev: TouchEvent & MouseEvent) {
        const clientX = ev.targetTouches ? ev.targetTouches[0].clientX : ev.clientX;
        (clientX > 64 || this.stack.length < 2) && ev.stopImmediatePropagation()
    }

    rafId?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTouchPan(ev: any) {
        const { v1, v2, shade } = this.getViews()

        const panOffset = Math.max(0, ev.offset.x)
        const ratio = Math.min(1, panOffset / v1.clientWidth)

        if (this.rafId) {
            cancelAnimationFrame(this.rafId)
        }

        if (!ev.isFirst && !ev.isFinal) {
            this.rafId = requestAnimationFrame(() => {
                v1.style.transform = `translate(${panOffset}px)`
                v2.style.transform = `translate(${(ratio - 1) * v2.clientWidth / 5}px)`
                shade.style.opacity = `${1 - ratio}`
                this.rafId = undefined
            })
        }

        if (ev.isFirst) {
            v1.__transitionFinalize = () => {
                v1.style.transform = ''
                v1.style.transition = ''
            }

            v2.classList.add('srv--show-enforce')
            v2.__transitionFinalize = () => {
                v2.classList.remove('srv--show-enforce')
                v2.style.transform = ''
                v2.style.transition = ''
            }

            shade.classList.add('srv--show-enforce')
            shade.__transitionFinalize = () => {
                shade.style.opacity = ''
                shade.style.transition = ''
                shade.classList.remove('srv--show-enforce')
            }
        }

        if (ev.isFinal) {
            const v = this.velocity.v
            if ((panOffset > v1.clientWidth / 2 && v > 0) || v > 0.3) {
                v1.style.transition =
                    v2.style.transition =
                    shade.style.transition = 'all 0.2s'
                this.$router.go(-1)
            } else {
                this.guard(async () => {
                    v1.style.transition =
                        v2.style.transition =
                        shade.style.transition = 'all 0.2s cubic-bezier(0, 0, 0.2, 1)'

                    const ts = [
                        transit(v1, {
                            to: 'srv--v1-in-enforce'
                        }),
                        transit(shade, {
                            to: 'srv--shade-opaque-enforce'
                        })
                    ]

                    if (v2) {
                        ts.push(transit(v2, {
                            to: 'srv--v2-out-enforce'
                        }))
                    }
                    await Promise.all(ts)
                })
            }
        }

        this.velocity.update(ev.duration, ev.delta.x)
    }
}
</script>
<style >
.srv--transition-ease-out {
    transition: all 0.35s cubic-bezier(0, 0, 0.2, 1);
}
.srv--transition {
    transition: all 0.35s;
}
.srv--v1-out-enforce {
    transform: translate(100%) !important;
}
.srv--v1-out {
    transform: translate(100%);
}
.srv--v1-in-enforce {
    transform: translate(0px) !important;
}
.srv--v2-out-enforce {
    transform: translate(-20%) !important;
}
.srv--v2-out {
    transform: translate(-20%);
}
.srv--v2-in-enforce {
    transform: translate(0px) !important;
}
.srv--show-enforce {
    display: block !important;
}
.srv--disable-pointer-events {
    pointer-events: none;
}
.srv--shade-transparent {
    opacity: 0;
}
.srv--shade-transparent-enforce {
    opacity: 0 !important;
}
.srv--shade-opaque {
    opacity: 1;
}
.srv--shade-opaque-enforce {
    opacity: 1 !important;
}
.srv--shade-bg {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>
