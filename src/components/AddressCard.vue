<template>
    <q-card
        :style="{...background}"
        v-bind="$attrs"
        v-on="$listeners"
        class="bg-transition"
    >
        <ConnexContinuous
            :connex="connex"
            :query="()=> connex.thor.account(address).get()"
            v-slot="{data}"
        >
            <q-card-section class="text-white column no-wrap full-height overflow-hidden">
                <div
                    :style="{...iconStyles}"
                    class="absolute"
                ></div>
                <!-- balances -->
                <div class="text-right float-right">
                    <span class="text-h6 text-weight-regular">{{data?data.balance:null | balance}}</span>
                    <span class="monospace text-caption"> VET&nbsp;</span>
                </div>
                <div class="text-right">
                    <span class="text-h6 text-weight-regular">{{data?data.energy:null | balance}}</span>
                    <span class="monospace text-caption"> VTHO</span>
                </div>
                <q-space />
                <!-- address -->
                <div class="row items-baseline">
                    <!-- index -->
                    <span class="index">{{index+1}}</span>
                    <span class="monospace text-overline">{{address | checksum | abbrev(8,6)}}</span>
                    <q-space />
                    <!-- logo -->
                    <div class="logo inline-block" />
                </div>
            </q-card-section>
        </ConnexContinuous>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'
import Color from 'color'

/**
 * it rasterize svg into bitmap compressed in png format
 * @param svg the svg string
 * @returns url of bitmap
 */
function rasterize(svg: string) {
    const size = 200
    return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.setAttribute('width', size.toString())
            canvas.setAttribute('height', size.toString())
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                return reject(new Error('failed to get 2d context'))
            }
            ctx.drawImage(img, 0, 0, size, size)
            // ctx.globalCompositeOperation = 'soft-light'
            // ctx.fillStyle = '#666'
            // ctx.fillRect(0, 0, size, size)
            canvas.toBlob(r => {
                resolve(URL.createObjectURL(r))
            })
        }
        img.onerror = err => reject(err)
        img.src = `data:image/svg+xml;utf8,${svg}`
    })
}

const imageCache = new Map<string, Promise<string>>() // mapping address => imageurl

export default Vue.extend({
    props: {
        address: String,
        index: Number,
        connex: Object as () => Connex
    },
    data: () => {
        return {
            background: undefined as unknown as object,
            iconStyles: undefined as unknown as object, // type hacks for async-computed
            height: 0
        }
    },
    computed: {
        svg(): string {
            return picasso(this.address)
        }
    },
    asyncComputed: {
        async iconStyles(): Promise<object> {
            const img = await this.generateIconImg()
            return {
                background: `url('${img}') center / cover no-repeat`,
                width: '4rem',
                height: '4rem',
                borderRadius: '50%'
            }
        },
        async background(): Promise<object> {
            await this.generateIconImg() // to prevent background rendered before icon

            let str = this.svg
            let color!: Color
            for (let i = 0; i < 2; i++) {
                const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(str)
                if (m) {
                    color = color ? color.mix(Color(m[0]), 0.4) : Color(m[0])
                    str = str.slice(m.index + m[0].length)
                } else {
                    break
                }
            }

            const c1 = color.saturationl(50).lightness(45)
            const c2 = color.saturationl(50).lightness(65)
            return {
                background: `linear-gradient(to bottom, ${c1.rgb().string()}, ${c2.rgb().string()})`
            }
        }
    },
    methods: {
        generateIconImg() {
            const addr = this.address
            let img = imageCache.get(addr)
            if (!img) {
                const svg = picasso(addr)
                img = rasterize(svg)
                imageCache.set(addr, img)
            }
            return img
        },
        onResize(size: { height: number }) {
            if (size.height > 0) {
                this.height = size.height
            }
        }
    }
})
</script>
<style scoped>
.bg-transition {
    transition: background-image 0.3s;
}
.logo {
    opacity: 0.4;
    background: url(~assets/vechain-logo.svg);
    height: 2rem;
    width: 2rem;
}
.index {
    font-size: 4rem;
    font-weight: 100;
    line-height: 100%;
}
</style>
