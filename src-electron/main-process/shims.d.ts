declare global {
    declare namespace NodeJS {
        interface Global {
            __statics: string
        }
    }
}

import 'electron'
declare module 'electron' {
    interface App {
        openSQLite: () => Promise<SQLite.Database>
        listenOpenUrl: () => Promise<string>
    }
}
