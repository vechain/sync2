<template>
    <q-item
        class="q-my-md"
        clickable
    >
        <template v-if="token">
            <q-item-section avatar>
                <q-avatar square>
                    <q-img :src="token.iconSrc" />
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>{{token.symbol}}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon name="unfold_more" />
            </q-item-section>
        </template>
        <q-popup-proxy
            v-model="showTokenList"
            breakpoint="2000"
            :context-menu="false"
        >
            <q-card class="column full-width no-wrap">
                <q-toolbar>
                    <q-toolbar-title>Select Token</q-toolbar-title>
                </q-toolbar>
                <q-card-section
                    v-scrollDivider
                    class="col overflow-auto q-pt-none"
                >
                    <BalanceList
                        @select="onSelect"
                        :tokens="tokens"
                        :address="address"
                        :connex="connex"
                        selectabel
                    />
                </q-card-section>
            </q-card>
        </q-popup-proxy>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    model: {
        prop: 'symbol',
        event: 'change'
    },
    props: {
        connex: Object as () => Connex,
        address: String,
        tokens: Array as () => M.TokenSpec[],
        symbol: String
    },
    data() {
        return {
            showTokenList: false
        }
    },
    computed: {
        token(): M.TokenSpec | undefined {
            return this.tokens.find(item => item.symbol === this.symbol)
        }
    },
    methods: {
        onSelect(symbol: string) {
            this.$emit('change', symbol)
            this.showTokenList = false
        }
    }
})
</script>
