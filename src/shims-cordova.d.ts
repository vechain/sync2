/* eslint-disable @typescript-eslint/no-explicit-any */

declare interface Window {
    readonly sqlitePlugin: any
    readonly IonicDeeplink: {
        onDeepLink(cb: (a: {
            url: string
        }) => void)
    }
    plugins: {
        touchid: any
    }
    readonly Keyboard: any
}
