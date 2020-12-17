<template>
    <div>
        <item
            id="lang"
            icon="mdi-translate"
            :title="$t('settings.action_language')"
            :value="languageDisplayName($i18n.locale)"
            clickable
        />
        <q-popup-proxy
            target="#lang"
            anchor="bottom right"
            self="top right"
            :offset="[-16,0]"
        >
            <q-card>
                <q-list separator>
                    <q-item
                        clickable
                        v-close-popup
                        v-for="lang in $i18n.availableLocales"
                        :key="lang"
                        @click="setLanguage(lang)"
                    >
                        <q-item-section class="q-px-lg text-center">{{languageDisplayName(lang)}}</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-popup-proxy>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Item from './Item.vue'
import { languageDisplayName } from 'src/utils/language-display-name'

export default Vue.extend({
    components: { Item },
    methods: {
        languageDisplayName,
        setLanguage(lang: string) {
            this.$i18n.locale = lang
            this.$svc.config.saveLanguage(lang)
        }
    }
})
</script>
