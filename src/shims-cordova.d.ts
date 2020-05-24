/* eslint-disable @typescript-eslint/no-explicit-any */

declare interface Window {
    readonly sqlitePlugin: any
    handleOpenURL: ((url: string) => void) | undefined
    plugins: {
        touchid: any
    }
}

declare var cordova: {
    InAppBrowser: {
        open: Window['open']
    }
}
