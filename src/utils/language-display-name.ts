const lang2displayName: Record<string, string> = {
    'en-us': 'English (U.S.)',
    'zh-cn': '中文 (中国)'
}

export function languageDisplayName(lang: string) {
    const n = lang2displayName[lang]
    if (n) {
        return n
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ns = new (Intl as any).DisplayNames([lang], { type: 'language' })
        return ns.of(lang)
    } catch {
        return lang
    }
}
