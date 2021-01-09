<template>
    <div>
        <slot :displayName="displayName(configLang)" />
        <pop-sheets
            v-bind="$attrs"
            v-on="$listeners"
            :sheets="sheets"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'

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
    components: { PopSheets },
    computed: {
        sheets(): Sheet[] {
            // empty lang means auto
            return ['', ...this.$i18n.availableLocales]
                .map<Sheet>(lang => {
                    return {
                        label: this.displayName(lang) + (this.configLang === lang ? ' ✓' : ''),
                        action: () => { this.$svc.config.saveLanguage(lang) }
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
        }
    }
})
</script>
