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
                    <q-list>
                        <template v-for="token in tokens">
                            <Resolve
                                :key="token.symbol"
                                :promise="$svc.bc(token.gid).balanceOf(address, token)"
                                v-slot="{data}"
                            >
                                <TokenItem
                                    clickable
                                    @click="onSelect(token.symbol)"
                                    :balance="data"
                                    :token="token"
                                />
                            </Resolve>
                        </template>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-popup-proxy>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'

export default Vue.extend({
    components: {
        TokenItem
    },
    model: {
        prop: 'symbol',
        event: 'change'
    },
    props: {
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
        token() {
            return this.tokens.find(t => t.symbol === this.symbol)
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
