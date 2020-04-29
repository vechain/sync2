import { wrap } from './sqlite'

export function open() {
    const name = process.env.PROD ? 'data-store.db' : 'data-store-dev.db'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = window.sqlitePlugin.openDatabase({
        name,
        location: 'default',
        androidDatabaseProvider: 'system'
    })
    window.addEventListener('unload', () => { db.close() })

    return wrap({
        query: (sql, ...params) => {
            return new Promise((resolve, reject) => {
                db.executeSql(sql, params,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (res: any) => {
                        const rows = []
                        for (let i = 0; i < res.rows.length; i++) {
                            rows.push(res.rows.item(i))
                        }
                        resolve(rows)
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (err: any) => reject(err))
            })
        },
        exec: (sql, ...params) => {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                db.executeSql(sql, params, () => resolve(), (err: any) => reject(err))
            })
        }
    })
}
