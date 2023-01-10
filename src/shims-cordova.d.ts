/* eslint-disable @typescript-eslint/no-explicit-any */

declare interface Window {
    readonly sqlitePlugin: any
    readonly IonicDeeplink: {
        onDeepLink(cb: (a: {
            url: string
        }) => void)
    }
    readonly Fingerprint: Fingerprint
    readonly Keyboard: any
    readonly StatusBar: any
}

declare interface CordovaPlugins {
    clipboard
}

declare interface Cordova {
    InAppBrowser: InAppBrowser;
}