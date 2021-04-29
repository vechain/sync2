export async function copyText(text: string): Promise<void> {
    if (process.env.MODE === 'cordova') {
        return new Promise((resolve, reject) => {
            window.cordova.plugins.clipboard.copy(text, resolve, reject)
        })
    } else {
        return (await import('quasar')).copyToClipboard(text)
    }
}
