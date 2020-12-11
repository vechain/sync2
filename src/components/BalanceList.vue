<template>
    <q-list>
        <!-- <connex-continuous
            :connex="connex"
            :query="() => connex.thor.account(address).get()"
            v-slot="{data}"
        >
            <TokenBalanceItem
                :dense="dense"
                @click="onSelect('VET')"
                :clickable="selectabel"
                :balance="data && data.balance"
                :token="VET"
            />
            <q-separator inset="item" />
            <TokenBalanceItem
                :dense="dense"
                @click="onSelect('VTHO')"
                :clickable="selectabel"
                :balance="data && data.energy"
                :token="VTHO"
            />
        </connex-continuous>

        <template v-for="(spec, index) in tokens">
            <q-separator
                :key="`${index}-s`"
                inset="item"
            />
            <connex-continuous
                :connex="connex"
                :key="index"
                :query="() => tokenBalanceOf(connex, address, spec)"
                v-slot="{data}"
            >
                <TokenBalanceItem
                    :dense="dense"
                    @click="onSelect(spec.symbol)"
                    :clickable="selectabel"
                    :token="spec"
                    :balance="data"
                />
            </connex-continuous>
        </template> -->
    </q-list>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    // data() {
    //     return {
    //         VET: tokenSpecs.VET,
    //         VTHO: tokenSpecs.VTHO
    //     }
    // },
    // props: {
    //     connex: Object as () => Connex,
    //     address: String,
    //     tokens: Array as () => M.TokenSpec[],
    //     selectabel: {
    //         type: Boolean,
    //         default: false
    //     },
    //     dense: {
    //         type: Boolean,
    //         default: false
    //     }
    // },
    // methods: {
    //     tokenBalanceOf,
    //     onSelect(symbol: string) {
    //         this.$emit('select', symbol)
    //     }
    // }
})
</script>
