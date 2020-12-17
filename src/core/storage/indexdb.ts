import Dexie from 'dexie'
import type { Storage } from './index'
import { newObservable } from './observable'

function wrapTable<T extends Storage.Entity>(table: Dexie.Table<T, number>): Storage.Table<T> {
    const ob = newObservable()
    return {
        insert: async (row, replace) => {
            let id
            if (replace) {
                id = await table.put(row as T)
            } else {
                id = await table.add(row as T)
            }
            ob.notify()
            return id
        },
        update: async (cond, values) => {
            if (Object.keys(cond).length > 0) {
                await table.where(cond as {}).modify(values)
            } else {
                await table.toCollection().modify(values)
            }
            ob.notify()
        },
        delete: async cond => {
            if (Object.keys(cond).length > 0) {
                await table.where(cond as {}).delete()
            } else {
                await table.toCollection().delete()
            }
            ob.notify()
        },
        all: () => {
            const opt: {
                equal?: Partial<T>
                notEqual?: Partial<T>
                reverse?: boolean
                limit?: {
                    count: number
                    offset?: number
                }
            } = {}

            return {
                where(cond) {
                    opt.equal = cond
                    return this
                },
                except(cond) {
                    opt.notEqual = cond
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
                    if (opt.equal) {
                        c = table.where(opt.equal as {})
                    }
                    if (opt.notEqual) {
                        const cond = opt.notEqual
                        const keys = Object.keys(cond)
                        if (!c && keys.length === 1) {
                            const key = keys[0]
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            c = table.where(key).notEqual((cond as any)[key])
                        } else {
                            c = c || table.toCollection()
                            c = c.filter(i => {
                                for (const key in cond) {
                                    if (i[key] === cond[key]) {
                                        return false
                                    }
                                }
                                return true
                            })
                        }
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
        },
        observe: () => {
            return ob.observe()
        }
    }
}

export async function open(): Promise<Storage> {
    const db = new Dexie(
        process.env.PROD ? 'data-store' : 'data-store-dev'
    )

    db.version(1).stores({
        configs: '[key+subKey]',
        wallets: '++id, gid',
        activities: '++id, type, walletId, createdTime, status'
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
        },
        waitFor: p => Dexie.waitFor(p)
    }
}
