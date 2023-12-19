<template>
    <q-tab-panels
        class="col"
        animated
        v-model="panel"
        transition-next="jump-up"
    >
        <q-tab-panel
            name="notice"
            class="column q-pa-none no-wrap"
        >
            <page-content
                padding
                class="col"
                innerClass="fit column justify-evenly"
            >
                <notice />
            </page-content>
            <page-action>
                <q-btn
                    :label="$t('common.next')"
                    unelevated
                    color="primary"
                    @click="$emit('start')"
                />
            </page-action>
        </q-tab-panel>
        <q-tab-panel
            name="words"
            class="column q-pa-none no-wrap"
        >
            <page-content class="col q-pa-sm">
                <Words :words="words" />
            </page-content>
            <page-action>
                <q-btn
                    :label="$t('backup.action_next_verify')"
                    unelevated
                    @click="$emit('next')"
                    color="primary"
                />
            </page-action>
        </q-tab-panel>
        <q-tab-panel
            name="check"
            class="column q-pa-none no-wrap"
        >
            <page-content
                class="col q-pa-sm"
                innerClass="fit"
            >
                <CheckWords
                    :words="words"
                    @checked="$emit('next')"
                />
            </page-content>
        </q-tab-panel>
        <q-tab-panel
            name="done"
            class="column q-pa-none no-wrap"
        >
            <page-content
                class="column fit"
                innerClass="fit column justify-evenly"
            >
                <q-list class="text-center">
                    <q-item>
                        <q-item-section>
                            <q-icon
                                size="4rem"
                                class="q-mx-auto"
                                name="verified_user"
                                color="positive"
                            />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-h6 text-dark">{{$t('backup.label_backed_up')}}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-body1 text-dark">{{$t('backup.msg_backed_up')}}</q-item-label>
                        </q-item-section>
                    </q-item>

                </q-list>
            </page-content>
            <page-action>
                <q-btn
                    :label="$t('common.finish')"
                    unelevated
                    @click="onFinish"
                    color="primary"
                />
            </page-action>
        </q-tab-panel>
    </q-tab-panels>
</template>
<script lang="ts">
import Vue from 'vue'
import Words from './Words.vue'
import CheckWords from './CheckWords.vue'
import Notice from './Notice.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'
export default Vue.extend({
    props: {
        panel: String,
        walletId: Number,
        words: {
            type: Array as () => string[],
            default: () => []
        },
        meta: {
            type: Object as () => M.Wallet.Meta,
            default: () => {}
        }
    },
    components: {
        Words,
        CheckWords,
        Notice,
        PageContent,
        PageAction
    },
    data() {
        return {}
    },
    methods: {
        async onFinish() {
            const m: M.Wallet.Meta = {
                ...this.meta as M.Wallet.Meta,
                backedUp: true
            }
            try {
                await this.$loading(
                    () => {
                        return this.$svc.wallet.update(this.walletId, m)
                    }
                )
            } catch (error) {
                console.warn(error)
            }

            this.$emit('done')
        }
    }
})
</script>
