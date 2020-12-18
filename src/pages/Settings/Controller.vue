<template>
    <div class="column fit">
        <page-toolbar :title="$t('settings.title')" />
        <q-list
            padding
            v-scrollDivider
            class="col narrow-page q-mx-auto overflow-auto"
        >
            <language-list-popup
                v-slot="{displayName}"
                anchor="bottom right"
                self="top right"
                :offset="[-16, 0]"
            >
                <item
                    icon="mdi-translate"
                    :title="$t('settings.action_language')"
                    :value="displayName"
                    clickable
                />
            </language-list-popup>
            <q-separator inset="item" />
            <item
                icon="mdi-lock"
                :title="$t('settings.action_change_password')"
                clickable
                @click="onClickChangePassword()"
            />
            <q-separator inset="item" />
            <item
                icon="mdi-shield-account"
                :title="$t('settings.action_bio_auth')"
            >
                <q-toggle
                    color="green"
                    :value="bioPassSaved"
                    :disable="bioPassSaved===null"
                    @input="toggleBioPass"
                />
            </item>
            <q-separator inset="item" />
            <item
                icon="mdi-plus-circle-multiple-outline"
                :title="$t('settings.action_token_list')"
                :to="{name: 'tokens-setting'}"
            />
            <q-separator inset="item" />
            <item
                icon="mdi-access-point-network"
                :title="$t('settings.action_nodes')"
                :to="{name: 'nodes-setting'}"
            />
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Item from './Item.vue'
import NewPasswordDialog from 'pages/NewPasswordDialog'
import { Vault } from 'core/vault'
import { BioPass } from 'src/utils/bio-pass'
import LanguageListPopup from 'pages/LanguageListPopup.vue'

export default Vue.extend({
    components: { Item, LanguageListPopup },
    asyncComputed: {
        bioPass() {
            return BioPass.open()
        }
    },
    computed: {
        bioPassSaved(): boolean | null {
            return this.bioPass ? this.bioPass.saved : null
        }
    },
    methods: {
        // TODO faceID
        async toggleBioPass(newVal: boolean) {
            const bioPass = this.bioPass
            if (!bioPass) {
                return
            }

            try {
                if (newVal) {
                    const password = await this.$authenticate()
                    await bioPass.save(password)
                } else {
                    await bioPass.delete()
                }
                this.$asyncComputed.bioPass.update()
            } catch (err) {
                console.warn(err)
            }
        },
        async onClickChangePassword() {
            const password = await this.$authenticate()
            this.$q.dialog({
                component: NewPasswordDialog,
                parent: this
            }).onOk((newPassword: string) => {
                this.$loading(async () => {
                    try {
                        const newShadow = await Vault.shadowPassword(newPassword)
                        await this.$svc.wallet.reEncryptAll(v => {
                            return Vault.decode(v)
                                .then(v => v.clone(password, newPassword))
                                .then(v => v.encode())
                        }, () => this.$svc.config.savePasswordShadow(newShadow))
                        this.$q.notify('Password changed.')
                    } catch (err) {
                        this.$q.notify({
                            type: 'negative',
                            message: `error occurred: ${err.message}`
                        })
                    }
                })
            })
        }
    }
})
</script>