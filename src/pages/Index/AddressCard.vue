<template>
    <div
        class="text-white column no-wrap q-py-xs"
        :style="{...background}"
        v-on="$listeners"
    >
        <q-item>
            <q-item-section avatar>
                <address-avatar
                    size="3.6rem"
                    :addr="address"
                />
            </q-item-section>
            <q-item-section
                class="text-right no-wrap"
                no-wrap
            >
                <!-- balances -->
                <q-item-label
                    v-for="(bal, i) in balances"
                    :key="i"
                >
                    <amount-label
                        class="amount"
                        :value="bal.value"
                        :decimals="bal.decimals"
                    >--.--</amount-label>
                    <span
                        class="monospace text-caption q-ml-sm"
                        v-html="bal.symbol"
                    />
                </q-item-label>
            </q-item-section>
        </q-item>
        <q-item class="q-mt-auto">
            <q-item-section no-wrap>
                <q-item-label>
                    <!-- index -->
                    <span class="index">{{index+1}}</span>
                    <!-- address -->
                    <address-label
                        :addr="address"
                        style="font-size: 0.85rem"
                    />
                </q-item-label>
            </q-item-section>
            <q-item-section />
            <q-item-section avatar>
                <!-- logo -->
                <img
                    src="~assets/vechain-logo.svg"
                    class="logo"
                >
            </q-item-section>
        </q-item>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { picasso } from '@vechain/picasso'
import Color from 'color'
import AddressLabel from 'src/components/AddressLabel.vue'
import AmountLabel from 'src/components/AmountLabel.vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'

export default Vue.extend({
    components: { AddressLabel, AmountLabel, AddressAvatar },
    props: {
        address: String,
        index: Number,
        account: Object as () => (Connex.Thor.Account | null)
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
                    color = color ? color.mix(Color(m[0]), 0.15) : Color(m[0])
                    str = str.slice(m.index + m[0].length)
                } else {
                    break
                }
            }
            const c1 = color.saturationl(20).lightness(20)
            const c2 = color.saturationl(30).lightness(30)
            return {
                background: `linear-gradient(to bottom, ${c1.rgb().string()}, ${c2.rgb().string()})`
            }
        },
        balances() {
            return [{
                value: this.account && this.account.balance,
                symbol: 'VET&nbsp;',
                decimals: 18
            },
            {
                value: this.account && this.account.energy,
                symbol: 'VTHO',
                decimals: 18
            }]
        }
    }
})
</script>
<style scoped>
.logo {
    opacity: 0.4;
    background: url(~assets/vechain-logo.svg);
    height: 2.4rem;
    width: 2.4rem;
}
.index {
    display: inline-block;
    font-size: 4rem;
    font-weight: 100;
    line-height: 100%;
    min-width: 2.5rem;
}
.amount {
    font-size: 1.25rem;
    line-height: 1.6rem;
}
</style>
