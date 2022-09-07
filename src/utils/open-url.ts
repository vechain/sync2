import { openURL as defaultOpen } from 'quasar'

export const openURL = (url: string) => {
    if (process.env.MODE === 'cordova') {
        cordova.InAppBrowser.open(url, '_system')
    } else {
        defaultOpen(url)
    }
}
