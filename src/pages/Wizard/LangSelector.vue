<template>
    <q-btn
        flat
        icon="mdi-translate"
        size="sm"
        color="primary"
        :label="languageDisplayName($i18n.locale)"
    >
        <q-popup-proxy
            anchor="bottom right"
            self="top right"
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
    </q-btn>
</template>
<script lang="ts">
import Vue from 'vue'
import { languageDisplayName } from 'src/utils/language-display-name'

export default Vue.extend({
    methods: {
        languageDisplayName,
        setLanguage(lang: string) {
            this.$i18n.locale = lang
            this.$svc.config.saveLanguage(lang)
        }
    }
})
</script>
