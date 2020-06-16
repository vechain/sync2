<template>
    <div class="drawer-container fixed q-drawer--top-padding">
        <!-- the backdrop -->
        <div
            ref="backdrop"
            class="drawer-backdrop fixed-full"
            v-show="panning||opened||transiting"
            v-touch-pan.left.mouse.prevent="transiting? undefined:handleTouchPan"
            @click="onClickBackdrop"
        />
        <!-- the opener -->
        <div
            v-show="!opened&&!transiting&&!disable"
            class="drawer-opener fixed-left"
            v-touch-pan.right.mouse.prevent="handleTouchPan"
        />
        <!-- content wrapper-->
        <aside
            class="drawer fixed-left q-drawer__content"
            :class="{invisible: !(panning||opened||transiting)}"
            v-touch-pan.left.mouse.prevent="transiting? undefined:handleTouchPan"
        >
            <slot />
            <q-resize-observer @resize="onContentResize" />
        </aside>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { nextFrame, transitionEnd, newVelometer, newPipeline } from 'src/utils/transit'

export default Vue.extend({
    props: {
        value: Boolean,
        disable: Boolean
    },
    data: () => {
        return {
            drawerWidth: 0,
            panning: false,
            transiting: false,
            opened: false,
            velometer: newVelometer(),
            pipeline: newPipeline(),
            touchPanInitOffset: 0
        }
    },
    model: {
        prop: 'value',
        event: 'open'
    },
    computed: {
        animatedViews() {
            return [
                this.$parent.$el as HTMLElement,
                this.$refs.backdrop as HTMLElement
            ]
        }
    },
    watch: {
        value(newVal: boolean) {
            this.opened = newVal
        },
        opened() {
            this.pipeline.run(() => this.transit())
        }
    },
    methods: {
        onClickBackdrop() {
            if (this.opened) {
                this.opened = false
                this.$emit('open', false)
            }
        },
        setOpenRatio(ratio: number) {
            (this.$parent.$el as HTMLElement).style.setProperty('--drawer-open-ratio', `${ratio}`)
        },
        setTransitionDurationMul(m: number) {
            (this.$parent.$el as HTMLElement).style.setProperty('--drawer-transition-mul', `${m}`)
        },
        onContentResize(size: { width: number }) {
            if (size.width > 0) {
                (this.$parent.$el as HTMLElement).style.setProperty('--drawer-width', `${size.width}`)
                this.drawerWidth = size.width
            }
        },
        async transit() {
            this.transiting = true
            document.body.classList.add('drawer-body--prevent-scroll')

            await nextFrame()

            const views = this.animatedViews
            views.forEach(v => v.classList.add('drawer-transition'))

            await nextFrame()

            this.setOpenRatio(this.opened ? 1 : 0)

            await Promise.all(views.map(v => transitionEnd(v)))

            views.forEach(v => v.classList.remove('drawer-transition'))

            if (!this.opened) {
                document.body.classList.remove('drawer-body--prevent-scroll')
            }
            this.setTransitionDurationMul(1)
            this.transiting = false
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleTouchPan(ev: Record<string, any>) {
            if (ev.isFirst) {
                document.body.classList.add('drawer-body--prevent-scroll')
                this.panning = true
                this.touchPanInitOffset = ev.offset.x
            }

            const width = Math.max(1, this.drawerWidth)
            const offset = Math.min(Math.abs(ev.offset.x - this.touchPanInitOffset), width)
            const ratio = this.opened ? (width - offset) / width : offset / width
            this.setOpenRatio(ratio)

            if (ev.isFinal) {
                this.panning = false
                const v = this.opened ? -this.velometer.velocity : this.velometer.velocity

                const triggered = (offset > width / 3 && v >= 0) || v > 0.3
                this.setTransitionDurationMul(0.7)
                if (triggered) {
                    this.opened = !this.opened
                    this.$emit('open', this.opened)
                } else {
                    this.pipeline.run(() => this.transit())
                }
            }

            this.velometer.update(ev.duration, ev.delta.x)
        }
    },
    mounted() {
        this.$parent.$el.classList.add('drawer-parent')
        this.opened = this.value
    },
    beforeDestroy() {
        this.$parent.$el.classList.remove('drawer-parent')
    }
})
</script>
<style >
:root {
    --drawer-width: 0;
    --drawer-open-ratio: 0;
    --drawer-transition-mul: 1;
}
.drawer-container {
    z-index: 2001;
}
.drawer-backdrop {
    background: black;
    opacity: calc(var(--drawer-open-ratio) * 0.1);
}
.drawer-opener {
    width: 20px;
}
.drawer {
    transform: translateX(-100%);
}
.drawer-parent {
    transform: translateX(
        calc(var(--drawer-width) * var(--drawer-open-ratio) * 1px)
    );
}
.drawer-transition {
    transition: all calc(0.25s * var(--drawer-transition-mul));
}
.drawer-body--prevent-scroll {
    position: fixed !important;
}
</style>
