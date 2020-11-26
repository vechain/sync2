<template>
    <q-toolbar>
        <q-btn
            flat
            dense
            round
            :icon="nav? nav.icon : 'navigate_before'"
            @click="onClickNavButton()"
        />
        <q-toolbar-title class="text-center">
            <div
                ref="title"
                :style="titleStyle"
            >{{title}}
            </div>
            <q-resize-observer
                @resize="centerTitleText"
                debounce="0"
            />
        </q-toolbar-title>
        <!-- action buttons -->
        <slot />
        <div
            v-if="warn"
            class="fixed-center z-top no-pointer-events q-pa-lg text-h2 text-no-wrap text-capitalize"
            style="background: rgba(0,0,0,0.25);color: rgba(255,0,0,0.8)"
        >
            {{warn}}
        </div>
    </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        title: String,
        nav: Object as () => { icon: string, action: () => void },
        gid: String // to check if in dev mode
    },
    data: () => {
        return {
            titleMargin: {
                left: 0,
                right: 0
            }
        }
    },
    computed: {
        warn(): string {
            if (this.gid) {
                const net = this.$options.filters!.net(this.gid)
                if (net !== 'main') {
                    return net + ' net'
                }
            }
            return ''
        },
        titleStyle(): { marginLeft: string, marginRight: string } {
            return {
                marginLeft: `${this.titleMargin.left}px`,
                marginRight: `${this.titleMargin.right}px`
            }
        }
    },
    methods: {
        onClickNavButton() {
            if (this.nav) {
                this.nav.action()
            } else {
                this.$stack.canGoBack ? this.$router.back() : this.$router.replace('/')
            }
        },
        centerTitleText() {
            const titleRect = (this.$refs.title as HTMLElement).getBoundingClientRect()
            const containerRect = (this.$el as HTMLElement).getBoundingClientRect()

            const leftSpace = titleRect.left - containerRect.left - this.titleMargin.left
            const rightSpace = containerRect.right - titleRect.right - this.titleMargin.right

            this.titleMargin.left = Math.max(leftSpace, rightSpace) - leftSpace
            this.titleMargin.right = Math.max(leftSpace, rightSpace) - rightSpace
        }
    }
})
</script>
