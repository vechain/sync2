import Dexie from 'dexie'

function buildQuery<T extends DataStore.Entity>(table: Dexie.Table<T, number>): DataStore.Query<T> {
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

function wrapTable<T extends DataStore.Entity>(table: Dexie.Table<T, number>): DataStore.Table<T> {
    return {
        insert: (...rows) => {
            return table.bulkAdd(rows as []).then(() => { })
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
            return buildQuery(table)
        }
    }
}

export function open(): DataStore {
    const db = new Dexie('data_store')
    db.version(1).stores({
        configs: '++id, &key',
        wallets: '++id, network',
        activities: '++id, [network+walletId+createdTime], closed'
    })

    return {
        configs: wrapTable(db.table<DataStore.ConfigEntity, number>('configs')),
        wallets: wrapTable(db.table<DataStore.WalletEntity, number>('wallets'))
    }
}
