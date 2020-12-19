<template>
    <div>
        <slot :displayName="displayName(configLang)" />
        <q-popup-proxy
            v-bind="$attrs"
            v-on="$listeners"
            position="bottom"
        >
            <q-card>
                <q-list separator>
                    <q-item
                        clickable
                        v-close-popup
                        v-for="(item,i) in items"
                        :key="i"
                        @click="setLanguage(item.lang)"
                    >
                        <q-item-section class="q-px-lg text-center">{{item.displayName}}</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-popup-proxy>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

// maps lang to lang's localized display name
const displayNames: Record<string, string> = {
    'en-us': 'English (U.S.)',
    'zh-cn': '中文 (中国)'
}

type Item = {
    lang: string
    displayName: string
}

export default Vue.extend({
    computed: {
        items(): Array<Item> {
            // empty lang means auto
            return ['', ...this.$i18n.availableLocales]
                .map(lang => {
                    return {
                        lang,
                        displayName: this.displayName(lang)
                    }
                })
        }
    },
    asyncComputed: {
        configLang() {
            return this.$svc.config.getLanguage()
        }
    },
    methods: {
        displayName(lang: string): string {
            if (!lang) {
                return this.$t('common.lang_auto').toString()
            }
            const name = displayNames[lang]
            if (name) {
                return name
            }
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ns = new (Intl as any).DisplayNames([lang], { type: 'language' })
                return ns.of(lang)
            } catch {
                return lang
            }
        },
        setLanguage(lang: string) {
            this.$svc.config.saveLanguage(lang)
        }
    }
})
</script>
