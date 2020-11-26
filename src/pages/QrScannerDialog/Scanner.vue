<template>
    <div>
        <video
            ref="vid"
            class="fit"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import QrScanner from 'qr-scanner'
import QrScannerWorkerPath from '!!file-loader!../../../node_modules/qr-scanner/qr-scanner-worker.min.js'

QrScanner.WORKER_PATH = QrScannerWorkerPath

export default Vue.extend({
    mounted() {
        const scanner = new QrScanner(
            this.$refs.vid as HTMLVideoElement,
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
})
</script>
