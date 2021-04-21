<template>
    <div class="relative-position bg-black">
        <video
            v-if="!isCordova"
            ref="vid"
            class="fit"
        />
        <div
            class="absolute-center"
            :style="scanRegionStyles"
        />
        <q-resize-observer
            @resize="size.w = $event.width;size.h = $event.height"
            :debounce="0"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { QrScanner } from 'src/utils/qr-scanner'

export default Vue.extend({
    data: () => {
        return {
            size: { w: 0, h: 0 }
        }
    },
    computed: {
        scanRegionStyles() {
            const { w, h } = this.size
            const x = Math.min(w, h) * 2 / 3
            return {
                border: '1px solid green',
                width: `${x}px`,
                height: `${x}px`
            }
        },
        isCordova(): boolean {
            return process.env.MODE === 'cordova'
        }
    },
    mounted() {
        if (this.isCordova) {
            const appElem = document.getElementById('q-app')!
            let destroyed = false
            this.$once('hook:beforeDestroy', () => {
                destroyed = true
                appElem.style.opacity = ''
                window.QRScanner.hide()
                window.QRScanner.destroy()
            })
            window.QRScanner.prepare((err, status) => {
                if (err) {
                    return this.$emit('error', err)
                }
                if (!status.authorized) {
                    return this.$emit('error', new Error('permission denied'))
                }
                if (!destroyed) {
                    appElem.style.opacity = '0';
                    (this.$el as HTMLElement).classList.remove('bg-black')
                    window.QRScanner.show()
                    window.QRScanner.scan((err, result) => {
                        if (err) {
                            return this.$emit('error', err)
                        }
                        this.$emit('input', result)
                    })
                }
            })
        } else {
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

            scanner.start().catch(err => {
                this.$emit('error', err)
            })

            this.$once('hook:beforeDestroy', () => {
                scanner.stop()
            })
        }
    }
})
</script>
