<template>
    <div>
        <q-item dense>
            <q-item-section
                avatar
                style="min-width:0px"
            >
                <token-avatar
                    :spec="op.token"
                    size="sm"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label class="ellipsis">
                    <amount-label
                        style="font-size:1.2rem;"
                        :value="op.amount"
                        :decimals="op.token.decimals"
                        long
                    />
                    {{op.token.symbol}}
                </q-item-label>
            </q-item-section>
        </q-item>
        <q-item dense>
            <q-item-section avatar />
            <q-item-section top>
                <q-icon name="mdi-subdirectory-arrow-right" />
            </q-item-section>
            <q-item-section
                v-if="op.to"
                avatar
            >
                <address-avatar
                    :addr="op.to"
                    size="1em"
                />
            </q-item-section>
            <q-item-section avatar>
                <q-item-label class="ellipsis">
                    <address-label :addr="op.to">
                        New Contract
                    </address-label>
                </q-item-label>
            </q-item-section>
        </q-item>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenAvatar from 'src/components/TokenAvatar.vue'
import { BigNumber } from 'bignumber.js'
import AddressLabel from 'src/components/AddressLabel.vue'
import AmountLabel from 'src/components/AmountLabel.vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'

export type OpTransfer = {
    type: 'transfer'
    token: M.TokenSpec
    amount: BigNumber
    to: string | null
}

export default Vue.extend({
    components: { TokenAvatar, AddressLabel, AmountLabel, AddressAvatar },
    props: {
        op: Object as () => OpTransfer
    }
})
</script>
