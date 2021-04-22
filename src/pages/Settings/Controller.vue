<template>
    <div class="column fit">
        <page-toolbar :title="$t('settings.title')" />
        <page-content class="col">
            <q-list padding>
                <language-list-popup
                    v-slot="{displayName}"
                    anchor="bottom right"
                    self="top right"
                    :offset="[-16, 0]"
                >
                    <item
                        icon="language"
                        :title="$t('settings.action_language')"
                        :value="displayName"
                        clickable
                    />
                </language-list-popup>
                <q-separator inset="item" />
                <item
                    icon="lock"
                    :title="$t('settings.action_change_password')"
                    clickable
                    @click="onClickChangePassword()"
                />
                <q-separator inset="item" />
                <template v-if="bioPass">
                    <item
                        icon="fingerprint"
                        :title="$t('settings.action_bio_auth')"
                    >
                        <q-toggle
                            color="green"
                            :value="bioPassSaved"
                            :disable="!bioPass"
                            @input="toggleBioPass"
                        />
                    </item>
                    <q-separator inset="item" />
                </template>
                <item
                    icon="control_point_duplicate"
                    :title="$t('settings.action_token_list')"
                    :to="{name: 'tokens-setting'}"
                />
                <q-separator inset="item" />
                <item
                    icon="perm_data_setting"
                    :title="$t('settings.action_nodes')"
                    :to="{name: 'nodes-setting'}"
                />
            </q-list>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Item from './Item.vue'
import NewPasswordDialog from 'pages/NewPasswordDialog'
import { BioPass } from 'src/utils/bio-pass'
import LanguageListPopup from 'pages/LanguageListPopup.vue'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'
import { kdfEncrypt } from 'src/core/vault'

export default Vue.extend({
    components: { Item, LanguageListPopup, PageToolbar, PageContent },
    asyncComputed: {
        bioPass() {
            return BioPass.open()
        },
        bioPassSaved(): Promise<boolean> {
            return this.$svc.config.getBioPassOn()
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
                    const umk = await this.$authenticate()
                    await bioPass.save(
                        'Biometric Authentication',
                        umk.toString('hex'))
                }
                await this.$svc.config.setBioPassOn(newVal)
            } catch (err) {
                console.warn(err)
            }
        },
        async onClickChangePassword() {
            try {
                const umk = await this.$authenticate()
                const newPassword = await this.$dialog<string>({ component: NewPasswordDialog })
                try {
                    await this.$loading(async () => {
                        const glob = await kdfEncrypt(umk, newPassword)
                        await this.$svc.config.setUserMasterKeyGlob(JSON.stringify(glob))
                    })
                    this.$q.notify(this.$t('settings.msg_password_changed'))
                } catch (err) {
                    // fatal error
                    console.error(err)
                }
            } catch { }
        }
    }
})
</script>
