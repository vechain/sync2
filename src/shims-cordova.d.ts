/* eslint-disable @typescript-eslint/no-explicit-any */

declare interface Window {
    readonly sqlitePlugin: any
    handleOpenURL: (url: string) => void
}
