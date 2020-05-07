<template>
    <div class="absolute-full">
        <div
            class="absolute-full"
            v-for="(entry, i) in stack"
            v-show="i >= stack.length - 1"
            ref="views"
            :key="entry.fullPath"
        >
            <component
                class="absolute-full"
                :is="entry.component"
                :entry="entry"
            />
        </div>
        <div
            v-show="stack.length>1"
            class="absolute absolute-left"
            style="width:16px;"
            v-touch-pan.up.right.prevent.mouse="onTouchPan"
        />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ScopedEntry } from 'vue-router-stack'
import { transit } from 'core/utils'

@Component
export default class StackedRouterView extends Vue {
    stack = this.$stack.scoped
    transitionDone = new Promise<unknown>(resolve => { resolve() })

    @Watch('$stack.scoped')
    async stackChanged(newVal: ScopedEntry[], oldVal: ScopedEntry[]) {
        await this.transitionDone
        // TODO more accurate transition judgement
        if (newVal.length > oldVal.length) {
            // push in
            this.stack = newVal
            await this.$nextTick()

            const views = this.$refs.views as HTMLElement[]
            const view1 = views[views.length - 1]
            const view2 = views[views.length - 2]

            this.transitionDone = Promise.all([
                transit(view1, {
                    from: 'top-view-in-from',
                    active: 'top-view-active'
                }),
                transit(view2, {
                    to: 'second-view-out-to',
                    active: 'second-view-active'
                })
            ])
        } else if (newVal.length < oldVal.length) {
            // pop out
            const views = this.$refs.views as HTMLElement[]
            const view1 = views[views.length - 1]
            const view2 = views[views.length - 2]

            this.transitionDone = Promise.all([
                transit(view1, {
                    to: 'top-view-out-to',
                    active: 'top-view-active'
                }),
                transit(view2, {
                    from: 'second-view-in-from',
                    to: 'second-view-in-to',
                    active: 'second-view-active'
                })
            ])

            await this.transitionDone
            this.stack = newVal
        } else {
            this.stack = newVal
        }
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

    async onTouchPan({ ...ev }) {
        await this.transitionDone

        const views = this.$refs.views as HTMLElement[]
        const view1 = views[views.length - 1]
        const view2 = views[views.length - 2]

        const panOffset = Math.max(0, ev.offset.x)

        view1.style.transform = `translate(${panOffset}px)`
        if (ev.isFirst) {
            view1.__transitionFinalize = () => {
                view1.style.transform = ''
            }
        }

        if (view2) {
            const ratio = Math.min(1, panOffset / view1.clientWidth)
            const offset = -((1 - ratio) * view2.clientWidth / 5)
            const brightness = 0.8 + 0.2 * ratio
            view2.style.transform = `translate(${offset}px)`
            view2.style.filter = `brightness(${brightness})`
            if (ev.isFirst) {
                view2.classList.add('touch-pan-active')
                view2.__transitionFinalize = () => {
                    view2.classList.remove('touch-pan-active')
                    view2.style.transform = ''
                    view2.style.filter = ''
                }
            }
        }

        if (ev.isFinal) {
            if (panOffset > view1.clientWidth / 2 || this.velocity.v > 0.3) {
                this.$router.go(-1)
            } else {
                const transitions = [transit(view1, {
                    to: 'top-view-in-to',
                    active: 'top-view-active'
                })]

                if (view2) {
                    transitions.push(transit(view2, {
                        to: 'second-view-out-to',
                        active: 'second-view-active'
                    }))
                }
                this.transitionDone = Promise.all(transitions)
            }
        }

        this.velocity.update(ev.duration, ev.delta.x)
    }
}

</script>
<style >
.top-view-out-to {
    transform: translate(100%) !important;
}
.top-view-in-from {
    transform: translate(100%);
}

.top-view-in-to {
    transform: translate(0px) !important;
}

.top-view-active {
    transition: all 0.2s;
}

.second-view-out-to {
    transform: translate(-20%) !important;
    filter: brightness(0.8);
}
.second-view-in-from {
    transform: translate(-20%);
    filter: brightness(0.8);
}

.second-view-in-to {
    transform: translate(0px) !important;
    filter: brightness(1) !important;
}

.second-view-active {
    transition: all 0.2s;
    display: block !important;
}

.touch-pan-active {
    display: block !important;
}
</style>
