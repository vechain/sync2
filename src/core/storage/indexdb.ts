import Dexie from 'dexie'
import type { Storage } from './index'

function wrapTable<T extends Storage.Entity>(table: Dexie.Table<T, number>): Storage.Table<T> {
    return {
        insert: row => {
            return table.add(row as T).then(() => { })
        },
        update: (cond, values) => {
            if (Object.keys(cond).length > 0) {
                return table.where(cond as {}).modify(values).then(() => { })
            } else {
                return table.toCollection().modify(values).then(() => { })
            }
        },
        delete: cond => {
            if (Object.keys(cond).length > 0) {
                return table.where(cond as {}).delete().then(() => { })
            }
            return table.toCollection().delete().then(() => { })
        },
        all: () => {
            const opt: {
                cond?: Partial<T>
                reverse?: boolean
                limit?: {
                    count: number
                    offset?: number
                }
            } = {}

            return {
                where(cond) {
                    opt.cond = cond
                    return this
                },
                reverse() {
                    opt.reverse = true
                    return this
                },
                limit(count, offset) {
                    opt.limit = {
                        count,
                        offset
                    }
                    return this
                },
                query() {
                    let c: Dexie.Collection<T, number> | undefined
                    if (opt.cond) {
                        c = table.where(opt.cond as {})
                    }
                    if (opt.reverse) {
                        c = (c || table).reverse()
                    }
                    if (opt.limit) {
                        if (opt.limit.offset) {
                            c = (c || table).offset(opt.limit.offset)
                        }
                        c = (c || table).limit(opt.limit.count)
                    }
                    return (c || table).toArray()
                }
            }
        }
    }
}

export async function open(): Promise<Storage> {
    const dbName = process.env.PROD ? 'data-store' : 'data-store-dev'
    const db = new Dexie(dbName)
    db.version(1).stores({
        configs: '++id, &key',
        wallets: '++id, network',
        activities: '++id, [network+walletId+createdTime]'
    })
    await db.open()

    return {
        configs: wrapTable(db.table<Storage.ConfigEntity, number>('configs')),
        wallets: wrapTable(db.table<Storage.WalletEntity, number>('wallets')),
        activities: wrapTable(db.table<Storage.ActivityEntity, number>('activities')),
        transaction: scope => {
            return db.transaction('rw', db.tables, () => {
                return scope()
            })
        }
    }
}
