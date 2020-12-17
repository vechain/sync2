import { remote } from 'electron'
import { wrap } from './sqlite'

export async function open() {
    const db = await remote.app.openSQLite()
    window.addEventListener('unload', () => { db.close() })

    return wrap({
        query: (sql, ...params) => {
            return db.all(sql, ...params)
        },
        exec: (sql, ...params) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return db.run(sql, ...params).then((r: any) => {
                return { insertId: r.lastID }
            })
        }
    })
}
