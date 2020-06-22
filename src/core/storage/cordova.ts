import { wrap } from './sqlite'
import { deviceReady } from 'src/utils/cordova'

export async function open() {
    await deviceReady

    const name = process.env.PROD ? 'data-store.db' : 'data-store-dev.db'
    const db = window.sqlitePlugin.openDatabase({
        name,
        location: 'default',
        androidDatabaseProvider: 'system'
    })
    window.addEventListener('unload', () => { db.close() })

    return wrap({
        query: (sql, ...params) => {
            return new Promise((resolve, reject) => {
                db.executeSql(
                    sql,
                    params,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (res: any) => {
                        const rows = []
                        for (let i = 0; i < res.rows.length; i++) {
                            rows.push(res.rows.item(i))
                        }
                        resolve(rows)
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (err: any) => reject(new Error(err.message))) // err is not an Error object
            })
        },
        exec: (sql, ...params) => {
            return new Promise((resolve, reject) => {
                db.executeSql(
                    sql,
                    params,
                    () => resolve(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (err: any) => reject(new Error(err.message)))
            })
        }
    })
}
