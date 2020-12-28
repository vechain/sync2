<template>
    <div class="column fit">
        <page-toolbar :title="$t('backup.title')" />
        <q-tab-panels
            class="col"
            animated
            v-model="panel"
            transition-next="jump-up"
        >
            <q-tab-panel
                name="notice"
                class="column q-pa-none"
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
                        @click="onStart()"
                    />
                </page-action>
            </q-tab-panel>
            <q-tab-panel
                name="words"
                class="column q-pa-none no-wrap"
            >
                <page-content
                    padding
                    class="col"
                    innerClass="fit column"
                >
                    <Words :words="words" />
                </page-content>
                <page-action>
                    <q-btn
                        :label="$t('backup.action_next_verify')"
                        unelevated
                        @click="panel = 'check'"
                        color="primary"
                    />
                </page-action>
            </q-tab-panel>
            <q-tab-panel
                name="check"
                class="column q-pa-none no-wrap"
            >
                <page-content
                    padding
                    class="col q-pb-sm"
                    innerClass="fit column"
                >
                    <CheckWords
                        :words="words"
                        @checked="panel = 'done'"
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
                                    name="mdi-shield-check"
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
                        @click="onDone"
                        color="primary"
                    />
                </page-action>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Words from './Words.vue'
import CheckWords from './CheckWords.vue'
import PageToolbar from 'components/PageToolbar.vue'
import Notice from './Notice.vue'
import { Vault } from 'src/core/vault'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'
export default Vue.extend({
    props: {
        walletId: String
    },
    components: {
        Words,
        CheckWords,
        Notice,
        PageToolbar,
        PageContent,
        PageAction
    },
    data() {
        return {
            wallet: null as unknown as M.Wallet | null,
            words: [] as string[],
            panel: 'notice' as 'notice' | 'words' | 'check' | 'done'
        }
    },
    asyncComputed: {
        async wallet(): Promise<M.Wallet | null> {
            return await this.$svc.wallet.get(parseInt(this.walletId))
        }
    },
    methods: {
        async onStart() {
            let pin = ''
            try {
                pin = await this.$authenticate()
            } catch (error) {
                console.warn(error)
                return
            }
            try {
                if (!this.wallet) { return }

                const vault = await Vault.decode(this.wallet.vault)
                const words = await vault.decrypt(pin)
                this.words = (words as string).split(' ')
                this.panel = 'words'
            } catch (error) {
                console.warn(error)
                this.$router.back()
            }
        },
        async onDone() {
            const meta: M.Wallet.Meta = {
                ...this.wallet!.meta,
                backedUp: true
            }
            try {
                await this.$loading(
                    () => {
                        return this.$svc.wallet.update(this.wallet!.id, meta)
                    }
                )
            } catch (error) {
                console.warn(error)
            }

            this.$router.back()
        }
    }
})
</script>
