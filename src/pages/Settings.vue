<template>
    <div class="column fit">
        <page-toolbar :title="$t('settings.title')" />
        <div
            v-scrollDivider
            class="col overflow-auto"
        >
            <q-list>
                <q-item
                    clickable
                    :to="{name: 'reset-pin-code'}"
                >
                    <q-item-section avatar>
                        <q-avatar icon="mdi-lock" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{$t('settings.action_change_password')}}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="keyboard_arrow_right"></q-icon>
                    </q-item-section>
                </q-item>
                <q-separator inset="item" />
                <q-item>
                    <q-item-section avatar>
                        <q-avatar icon="mdi-shield-account" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">{{$t('settings.action_bio_auth')}}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-toggle
                            color="green"
                            :value="bioPassSaved"
                            :disable="bioPassSaved===null"
                            @input="toggleBioPass"
                        />
                    </q-item-section>
                </q-item>
                <q-separator inset="item" />
                <q-item :to="{name: 'tokens-setting'}">
                    <q-item-section avatar>
                        <q-avatar icon="mdi-plus-circle-multiple-outline" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">{{$t('settings.action_token_list')}}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="keyboard_arrow_right"></q-icon>
                    </q-item-section>
                </q-item>
                <q-separator inset="item" />
                <q-item :to="{name: 'nodes-setting'}">
                    <q-item-section avatar>
                        <q-avatar icon="mdi-access-point-network" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">{{$t('settings.action_nodes')}}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="keyboard_arrow_right"></q-icon>
                    </q-item-section>
                </q-item>
                <q-separator inset="item" />
                <q-item>
                    <q-item-section avatar>
                        <q-avatar icon="mdi-earth" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">{{$t('settings.action_language')}}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="keyboard_arrow_right"></q-icon>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { BioPass } from 'src/utils/bio-pass'

export default Vue.extend({
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
        }
    }
})
</script>
