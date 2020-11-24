<template>
    <q-card
        flat
        :style="{...background}"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-card-section class="text-white column no-wrap full-height overflow-hidden">
            <!-- picasso icon -->
            <div
                :style="{...iconStyles}"
                class="absolute"
            />
            <!-- balances -->
            <div class="text-right">
                <span class="text-h6 text-weight-regular">{{account?account.balance:null | balance}}</span>
                <span class="monospace text-caption"> VET&nbsp;</span>
            </div>
            <div class="text-right">
                <span class="text-h6 text-weight-regular">{{account?account.energy:null | balance}}</span>
                <span class="monospace text-caption"> VTHO</span>
            </div>
            <div class="row items-baseline q-mt-auto">
                <!-- index -->
                <span class="index">{{index+1}}</span>
                <!-- address -->
                <span class="monospace text-overline">{{address | checksum | abbrev(8,6)}}</span>
                <!-- logo -->
                <div class="logo inline-block q-ml-auto" />
            </div>
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'
import Color from 'color'

export default Vue.extend({
    props: {
        address: String,
        index: Number,
        account: Object as () => Connex.Thor.Account
    },
    computed: {
        svg(): string {
            return picasso(this.address)
        },
        background(): object {
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
        },
        iconStyles(): object {
            return {
                background: `url('data:image/svg+xml;utf8,${this.svg}') center / cover no-repeat`,
                width: '4rem',
                height: '4rem',
                borderRadius: '50%'
            }
        }
    }
})
</script>
<style scoped>
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
    min-width: 2.5rem;
}
</style>
