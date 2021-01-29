declare global {
    declare namespace NodeJS {
        interface Global {
            __statics: string
        }
    }
}

import 'electron'
import * as SQLite from 'sqlite'
declare module 'electron' {
    interface App {
        listenOpenUrl: (webContentId: number) => Promise<string>
    }
}
