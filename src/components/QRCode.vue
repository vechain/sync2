
<template>
    <div
        :style="{width:size+'px',height:size+'px'}"
        v-html="html"
    ></div>
</template>
<script lang="ts">
import Vue from 'vue'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRious = require('qrious')

const qr = new QRious()
function generateQRHtml(content: string, size: number) {
    qr.value = content
    qr.size = size * 2

    const img = qr.image as HTMLElement
    img.style.width = '100%'
    img.style.height = '100%'
    return img.outerHTML
}

export default Vue.extend({
    data() {
        return { content: '' }
    },
    props: {
        size: Number
    },
    methods: {
        extractSlot() {
            this.content = this.$slots.default![0] ? (this.$slots.default![0].text! || '') : ''
        }
    },
    computed: {
        html(): string {
            return generateQRHtml(this.content, this.size || 100)
        }
    },
    created() {
        this.extractSlot()
    },
    beforeUpdate() {
        this.extractSlot()
    }
})
</script>
