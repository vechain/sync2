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
                <!-- logo -->
                <div
                    class="logo absolute-bottom-right"
                    :style="{...logoSize}"
                />
                <!-- balances -->
                <div class="text-right">
                    <span class="text-h6 text-weight-regular">{{data?data.balance:null | balance}}</span>
                    <span class="monospace text-caption"> VET&nbsp;</span></div>
                <div class="text-right">
                    <span class="text-h6 text-weight-regular">{{data?data.energy:null | balance}}</span>
                    <span class="monospace text-caption"> VTHO</span>
                </div>
                <q-space />
                <!-- address -->
                <div>
                    <!-- index -->
                    <span class="index">{{index+1}}</span>
                    <span class="monospace text-overline">{{address | checksum | abbrev(8,6)}}</span>
                </div>
            </q-card-section>
        </ConnexContinuous>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'

/**
 * it rasterize svg into bitmap compressed in png format
 * @param svg the svg string
 * @returns url of bitmap
 */
function rasterize(svg: string) {
    const size = 400
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
            ctx.globalCompositeOperation = 'soft-light'
            const grd = ctx.createLinearGradient(0, 0, size, size)
            grd.addColorStop(0, 'grey')
            grd.addColorStop(1, 'black')
            ctx.fillStyle = grd
            ctx.fillRect(0, 0, size, size)
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
            height: 0,
            backgroundImageUrl: ''
        }
    },
    computed: {
        svg() {
            return picasso(this.address)
        },
        background(): object {
            return {
                background: this.backgroundImageUrl ? `url('${this.backgroundImageUrl}') 0% 0% / cover no-repeat` : 'none'
            }
        },
        logoSize() {
            const size = this.height * 0.8
            return {
                width: `${size}px`,
                height: `${size}px`
            }
        }
    },
    watch: {
        address: {
            handler(addr: string) {
                if (!addr) {
                    this.backgroundImageUrl = ''
                    return
                }
                let img = imageCache.get(addr)
                if (!img) {
                    const svg = picasso(addr)
                    img = rasterize(svg)
                    imageCache.set(addr, img)
                }
                img.then(url => {
                    if (addr === this.address) {
                        this.backgroundImageUrl = url
                    }
                })
            },
            immediate: true
        }
    },
    methods: {
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
    transition: background 0.3s;
}
.logo {
    opacity: 0.15;
    margin-right: -3%;
    margin-bottom: -9%;
    background: url(~assets/vechain-logo.svg);
}
.index {
    font-size: 4.5rem;
    font-weight: 100;
    line-height: 100%;
}
</style>
