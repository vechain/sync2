<template>
    <div class="drawer-container fixed">
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
            v-show="!opened&&!transiting"
            class="drawer-opener fixed-left"
            v-touch-pan.right.mouse.prevent="handleTouchPan"
        />
        <!-- content wrapper-->
        <aside
            class="drawer fixed-left"
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
        value: Boolean
    },
    data: () => {
        return {
            drawerWidth: 0,
            panning: false,
            transiting: false,
            opened: false,
            velometer: newVelometer(),
            pipeline: newPipeline()
        }
    },
    model: {
        prop: 'value',
        event: 'open'
    },
    computed: {
        parent() { return this.$parent.$el as HTMLElement }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onContentResize(size: any) {
            this.drawerWidth = size.width
            this.parent.style.setProperty('--drawer-width', `${this.drawerWidth}`)
        },
        async transit() {
            this.transiting = true
            document.body.classList.add('drawer-body--prevent-scroll')
            const parent = this.$parent.$el as HTMLElement
            const backdrop = this.$refs.backdrop as HTMLElement

            await nextFrame()

            parent.classList.add('drawer-transition')
            backdrop.classList.add('drawer-transition')
            await nextFrame()

            parent.style.setProperty('--drawer-open-ratio', `${this.opened ? 1 : 0}`)

            await transitionEnd(parent)
            parent.classList.remove('drawer-transition')
            backdrop.classList.remove('drawer-transition')
            if (!this.opened) {
                document.body.classList.remove('drawer-body--prevent-scroll')
            }
            this.transiting = false
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleTouchPan(ev: Record<string, any>) {
            const parent = this.$parent.$el as HTMLElement

            const width = Math.max(1, this.drawerWidth)
            const offset = Math.min(Math.abs(ev.offset.x), width)

            if (!ev.isFirst && !ev.isFinal) {
                const ratio = this.opened ? (width - offset) / width : offset / width
                parent.style.setProperty('--drawer-open-ratio', `${ratio}`)
            }

            if (ev.isFirst) {
                document.body.classList.add('drawer-body--prevent-scroll')
                this.panning = true
            }

            if (ev.isFinal) {
                this.panning = false
                const v = this.opened ? -this.velometer.velocity : this.velometer.velocity

                const triggered = (offset > width / 3 && v >= 0) || v > 0.3

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
}
.drawer-container {
    z-index: 2001;
}
.drawer-backdrop {
    background: black;
    opacity: calc(var(--drawer-open-ratio) *0.1);
}
.drawer-opener {
    width: 15px;
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
    transition: all 0.25s;
}
.drawer-body--prevent-scroll {
    position: fixed !important;
}
</style>
