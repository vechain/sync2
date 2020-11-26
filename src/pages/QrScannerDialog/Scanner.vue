<template>
    <div class="relative-position">
        <video
            ref="vid"
            class="fit"
        >
            <q-resize-observer
                @resize="elemSize.w = $event.width;elemSize.h = $event.height"
                :debounce="0"
            />
        </video>
        <div
            class="absolute-center"
            :style="scanRegionStyles"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { QrScanner } from 'src/utils/qr-scanner'

export default Vue.extend({
    data: () => {
        return {
            vidSize: { w: 0, h: 0 },
            elemSize: { w: 0, h: 0 }
        }
    },
    computed: {
        scanRegionStyles() {
            if (this.vidSize.w > 0 && this.vidSize.h > 0) {
                const w1 = Math.min(this.vidSize.w, this.vidSize.h) * 2 / 3
                const w2 = w1 * this.elemSize.w / this.vidSize.w
                return {
                    border: '1px solid green',
                    width: `${w2}px`,
                    height: `${w2}px`
                }
            }
            return {}
        }
    },
    mounted() {
        const video = this.$refs.vid as HTMLVideoElement
        const scanner = new QrScanner(
            video,
            result => {
                this.$emit('input', result)
            },
            () => { },
            undefined,
            'environment'
        )
        video.addEventListener('loadedmetadata', () => {
            this.vidSize.w = video.videoWidth
            this.vidSize.h = video.videoHeight
        })

        scanner.start().catch(err => {
            this.$emit('error', err)
        })

        this.$once('hook:beforeDestroy', () => {
            scanner.stop()
        })
    }
})
</script>
