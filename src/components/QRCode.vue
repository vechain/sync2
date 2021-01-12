<template>
    <div v-html="svg"></div>
</template>
<script lang="ts">
import Vue from 'vue'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCode = require('qrcode-svg')

export default Vue.extend({
    data() {
        return { content: '' }
    },
    methods: {
        extractSlot() {
            this.content = this.$slots.default![0] ? (this.$slots.default![0].text! || '') : ''
        }
    },
    computed: {
        svg(): string {
            return new QRCode({
                content: this.content,
                container: 'svg-viewbox',
                join: true
            }).svg()
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
