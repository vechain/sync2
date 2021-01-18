<template>
    <q-toolbar class="q-px-xs">
        <q-btn
            flat
            round
            :icon="icon || 'chevron_left'"
            @click="onClickNavButton()"
        />
        <q-toolbar-title class="text-center">
            <div
                ref="title"
                class="ellipsis"
                :style="titleStyle"
            >{{title}}
            </div>
            <q-resize-observer
                @resize="centerTitleText"
                debounce="0"
            />
            <q-badge
                v-if="warn"
                color="negative"
                class="absolute-top-right no-pointer-events text-bold"
            >
                {{warn}}
            </q-badge>
        </q-toolbar-title>
        <!-- action buttons -->
        <slot />
    </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue'
import { genesises } from 'src/consts'
export default Vue.extend({
    props: {
        title: String,
        icon: String,
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
            if (!this.gid || this.gid === genesises.main.id) {
                return ''
            }
            return this.$netDisplayName(this.gid)
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
            if (this.$listeners.action) {
                this.$emit('action')
            } else {
                this.$backOrHome()
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
