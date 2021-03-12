import 'electron'
import type { newUpdater } from './updater'

declare module 'electron' {
    interface App {
        listenOpenUrl: (webContentId: number) => Promise<string>
        updater: ReturnType<typeof newUpdater>
    }
}

declare global {
    declare namespace NodeJS {
        interface Global {
            __statics: string
        }
    }

    interface NodeRequireFunction {
        (moduleName: '@electron/remote'): typeof Electron.remote;
    }
}
