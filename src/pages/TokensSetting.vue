<template>
    <div class="column fit">
        <page-toolbar title="Tokens" />
        <div
            v-scrollDivider
            class="col overflow-auto"
        >
            <async
                :fn="fetchTokenList"
                v-slot="{pending, error, reload}"
            >
                <q-list v-if="tokens.length>0">
                    <template v-for="(item, index) in tokens">
                        <q-separator
                            v-if="index !==0 "
                            :key="item.symbol + 's'"
                            inset="item"
                        />
                        <q-item :key="item.symbol">
                            <q-item-section avatar>
                                <q-avatar
                                    style="box-sizing: content-box; border: 1px solid #E5E5EA"
                                    size="md"
                                >
                                    <q-img :src="item.icon" />
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label lines="1">{{item.symbol}}</q-item-label>
                                <q-item-label caption>{{item.name}}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-toggle
                                    color="green"
                                    v-model="activeTokens"
                                    :val="item.symbol"
                                />
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
                <template v-else>
                    <q-inner-loading
                        v-if="pending"
                        showing
                    />
                    <div
                        v-else-if="!!error"
                        class="fit column flex-center"
                    >
                        <p>Something wrong</p>
                        <q-btn @click="reload">Refresh</q-btn>
                    </div>
                </template>
            </async>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { urls } from 'src/consts'

export default Vue.extend({
    data() {
        return {
            activeTokens: [] as string[]
        }
    },
    created() {
        this.activeTokens = Array.from(new Set<string>(this.$state.config.token.active))
    },
    async beforeDestroy() {
        await this.$state.config.set('activeTokens', JSON.stringify(this.activeTokens))
    },
    computed: {
        tokens() {
            return this.$state.config.token.list.map(t => ({
                ...t,
                icon: `${urls.tokenRegistry}assets/${t.icon}`
            }))
        }
    },
    methods: {
        fetchTokenList() {
            return this.$state.config.token.fetch()
        }
    }
})
</script>
