declare namespace NodeJS {
    interface Global {
        __statics: string
    }
}

declare module 'electron' {
    interface App {
        openSQLite(): Promise<SQLite.Database>
    }
}
