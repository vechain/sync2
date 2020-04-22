
async function open(): Promise<DataStore> {
    if (process.env.MODE === 'electron') {
        const remote = (await import('electron')).remote
        const db = await remote.app.openSQLite()
        window.addEventListener('unload', () => { db.close() })

        return (await import('./sqlite')).wrap({
            query: (sql, ...params) => {
                return db.all(sql, ...params)
            },
            exec: (sql, ...params) => {
                return db.run(sql, ...params).then(() => { })
            }
        })
    } else if (process.env.MODE === 'cordova') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = (window as any).sqlitePlugin.openDatabase({
            name: 'data-store.db',
            location: 'default',
            androidDatabaseProvider: 'system'
        })
        window.addEventListener('unload', () => { db.close() })

        return (await import('./sqlite')).wrap({
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
    } else {
        return (await import('./indexdb')).open()
    }
}

let instance: DataStore | undefined

export async function init(): Promise<DataStore> {
    if (instance) {
        return instance
    }
    instance = await open()
    return instance
}
