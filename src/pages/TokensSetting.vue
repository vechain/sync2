<template>
    <div class="column fit">
        <page-toolbar :title="$t('settings.action_token_list')" />
        <page-content class="col">
            <q-list
                v-if="tokens.length>0"
                padding
            >
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
            <div
                v-else
                class="fit column flex-center"
            >
                <q-spinner-dots
                    v-if="$asyncComputed.tokens.updating"
                    class="text-h2"
                />
                <template v-else>
                    <p>{{$t('common.something_wrong')}}</p>
                    <q-btn
                        unelevated
                        color="primary"
                        @click="$asyncComputed.tokens.update()"
                    >Refresh</q-btn>
                </template>
            </div>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageContent from 'src/components/PageContent.vue'

export default Vue.extend({
    components: { PageContent },
    data: () => {
        return {
            activeSymbols: null as string[] | null
        }
    },
    asyncComputed: {
        tokens: {
            async get(): Promise<M.TokenSpec[]> {
                if (!this.activeSymbols) {
                    this.activeSymbols = await this.$svc.config.token.activeSymbols()
                }
                const seen = new Set<string>()
                const all = await this.$svc.config.token.all()
                return all.filter(t => {
                    if (t.permanent || seen.has(t.symbol)) {
                        return false
                    }
                    seen.add(t.symbol)
                    return true
                })
            },
            default: []
        }
    },
    async beforeDestroy() {
        if (this.activeSymbols) {
            await this.$svc.config.token.saveActiveSymbols(this.activeSymbols)
        }
    }
})
</script>
