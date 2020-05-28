<template>
    <q-page class="bg-white">
        <q-list>
            <template v-for="(item, index) in tokens">
                <q-separator
                    v-if="index !==0 "
                    :key="item.symbol + 's'"
                    inset="item"
                />
                <q-item :key="item.symbol">
                    <q-item-section avatar>
                        <q-avatar
                            color="primary"
                            text-color="black"
                        />
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
    </q-page>
</template>
<script lang="ts">

import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            activeTokens: [] as string[]
        }
    },
    created() {
        this.$state.config.token.fetch()
        this.activeTokens = this.$state.config.token.active
    },
    async beforeDestroy() {
        await this.$state.config.set('activeTokens', JSON.stringify(this.activeTokens))
    },
    computed: {
        tokens() {
            return this.$state.config.token.distinctList
        }
    }
})
</script>
