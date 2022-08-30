<template>
    <div class="column fit">
        <page-toolbar :title="$t('settings.action_fee_delegation')" />
        <page-content class="col">
            <q-item>
                <q-item-section>
                    <q-item-label>{{ $t('feeDelegation.self_sign_on_failure') }}</q-item-label>
                </q-item-section>
                <q-toggle color="green" :value="selfSignOnFailure" @input="toggleSelfSignOnFailure" />
            </q-item>
            <q-separator inset="item" />
            <q-item>
                <q-item-section>
                    <q-item-label caption>{{$t('feeDelegation.default_delegator')}}</q-item-label>
                    <q-item-label clickable @click="onClickChangeDefaultDelegator()">
                        {{delegatorTitle}}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageContent from 'components/PageContent.vue'
import PageToolbar from 'components/PageToolbar.vue'
import SetDefaultDelegator from './SetDefaultDelegator.vue'

export default Vue.extend({
    components: { PageContent, PageToolbar },
    methods: {
        async toggleSelfSignOnFailure(newVal: boolean) {
            await this.$svc.config.setSelfSignOnFailure(newVal)
        },
        async onClickChangeDefaultDelegator() {
            try {
                const defaultDelegatorUrl = await this.$svc.config.getDefaultFeeDelegator()
                const delegatorUrl = await this.$dialog<string>({
                    component: SetDefaultDelegator,
                    state: { url: defaultDelegatorUrl }
                })

                await this.$svc.config.setDefaultFeeDelegator(delegatorUrl)
            } catch { }
        }
    },
    asyncComputed: {
        async delegatorTitle(): Promise<string> {
            const defaultDelegatorUrl = await this.$svc.config.getDefaultFeeDelegator()
            if (defaultDelegatorUrl !== "") {
                return defaultDelegatorUrl
            }

            return this.$t('feeDelegation.set_default_delegator').toString()
        },
        selfSignOnFailure(): Promise<boolean> {
            return this.$svc.config.getSelfSignOnFailure()
        }
    }
})
</script>
