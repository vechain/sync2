<template>
    <div
        class="column fit"
        v-if="wallet"
    >
        <page-toolbar title="Backup" />
        <q-tab-panels
            class="col column narrow-page q-mx-auto"
            animated
            v-model="panel"
            v-if="words.length"
            transition-next="jump-up"
        >
            <q-tab-panel name="words">
                <Words :words="words">
                    <div class="row justify-center q-mt-lg">
                        <q-btn
                            class="text-capitalize col-6"
                            label="I've written it down"
                            unelevated
                            @click="panel = 'check'"
                            color="blue-9"
                        />
                    </div>
                </Words>
            </q-tab-panel>
            <q-tab-panel name="check">
                <CheckWords
                    :words="words"
                    @checked="panel = 'done'"
                />
            </q-tab-panel>
            <q-tab-panel name="done">
                <div class="q-pa-lg">
                    <div class="q-pl-sm q-pb-md">
                        <q-icon
                            size="50px"
                            name="verified_user"
                        />
                    </div>
                    <span class="text-h4">Your wallet is now backed up</span>
                    <div class="text-body2 text-grey q-py-md">
                        The mnemonic words store all the information needed at any point in time to recover your wallet.
                    </div>
                    <div class="text-body2 text-grey q-py-sm">
                        The mnemonic words must be stored in a <strong class="text-black">secure place</strong>. It allows you to regain wallet access in a scenario where your device is lost, stolen, or unusable due to any reason.
                    </div>
                </div>
                <div class="justify-center row q-mt-lg">
                    <q-btn
                        class="text-capitalize col-6"
                        label="Done"
                        unelevated
                        @click="onDone"
                        color="blue-9"
                    />
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Words from './Words.vue'
import CheckWords from './CheckWords.vue'
import { Vault } from 'src/core/vault'
export default Vue.extend({
    props: {
        walletId: String
    },
    components: {
        Words,
        CheckWords
    },
    data() {
        return {
            wallet: null as unknown as M.Wallet | null,
            words: [] as string[],
            panel: 'words'
        }
    },
    async created() {
        try {
            this.wallet = await this.$svc.wallet.get(parseInt(this.walletId))

            if (!this.wallet) { return }

            const vault = await Vault.decode(this.wallet.vault)
            const pin = await this.$authenticate()
            const words = await vault.decrypt(pin)
            this.words = (words as string).split(' ')
        } catch (error) {
            console.warn(error)
            this.$router.back()
        }
    },
    methods: {
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
