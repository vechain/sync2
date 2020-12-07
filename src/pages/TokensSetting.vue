<template>
    <div class="column fit">
        <page-toolbar title="Tokens" />
        <div
            v-scrollDivider
            class="col overflow-auto"
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
                                <q-img :src="item.iconSrc" />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label lines="1">{{item.symbol}}</q-item-label>
                            <q-item-label caption>{{item.name}}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle
                                color="green"
                                v-model="activeSymbols"
                                :val="item.symbol"
                            />
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
            <template v-else>
                <q-inner-loading
                    v-if="$asyncComputed.tokens.updating"
                    showing
                />
                <div
                    v-else-if="$asyncComputed.tokens.error"
                    class="fit column flex-center"
                >
                    <p>Something wrong</p>
                    <q-btn @click="$asyncComputed.tokens.update()">Refresh</q-btn>
                </div>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data() {
        return {
            activeSymbols: null as string[] | null
        }
    },
    asyncComputed: {
        tokens: {
            async get(): Promise<M.TokenSpec[]> {
                if (!this.activeSymbols) {
                    this.activeSymbols = await this.$svc.config.activeTokenSymbols()
                }
                const seen: string[] = []
                const all = await this.$svc.config.tokens()
                return all.filter(t => {
                    if (t.permanent || seen.includes(t.symbol)) {
                        return false
                    }
                    seen.push(t.symbol)
                    return true
                })
            },
            default: []
        }
    },
    async beforeDestroy() {
        if (this.activeSymbols) {
            await this.$svc.config.setActiveTokenSymbols(this.activeSymbols)
        }
    }
})
</script>
