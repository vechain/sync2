// common logics for sqlite

import type { Storage } from './index'
import { newObservable } from './observable'

const schemas = [
    `CREATE TABLE IF NOT EXISTS configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        key TEXT NOT NULL,
        subKey TEXT NOT NULL,
        value TEXT
    )`,
    'CREATE UNIQUE INDEX IF NOT EXISTS configs_i0 ON configs(key, subKey)',
    `CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        gid TEXT NOT NULL,  
        vault TEXT,
        meta TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS wallets_i0 ON wallets(gid)',
    `CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        gid TEXT NOT NULL,
        type TEXT NOT NULL,
        walletId INTEGER NOT NULL,
        createdTime INTEGER NOT NULL,
        status TEXT NOT NULL,
        glob TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS activities_i0 ON activities(type)',
    'CREATE INDEX IF NOT EXISTS activities_i1 ON activities(walletId)',
    'CREATE INDEX IF NOT EXISTS activities_i2 ON activities(createdTime)',
    'CREATE INDEX IF NOT EXISTS activities_i3 ON activities(status)'
]

export interface SQLRunner {
    query<T extends Storage.Entity>(sql: string, ...params: unknown[]): Promise<T[]>
    exec(sql: string, ...params: unknown[]): Promise<void>
}

function wrapTable<T extends Storage.Entity>(runner: SQLRunner, tableName: string): Storage.Table<T> {
    const ob = newObservable()
    return {
        insert: (row, replace) => {
            const keys = []
            const values = [] as never[]
            for (const key in row) {
                keys.push(key)
                values.push((row as never)[key])
            }
            return runner.exec(`${replace ? 'REPLACE' : 'INSERT'} INTO ${tableName} (${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`,
                ...values)
                .then(() => ob.notify())
        },
        update: (cond, values) => {
            const keys = []
            const params = []
            for (const key in values) {
                keys.push(key)
                params.push(values[key])
            }

            let sql = `UPDATE ${tableName} SET ${keys.map(k => k + '=?').join(',')} WHERE 1`

            for (const key in cond) {
                sql += ` AND ${key}=?`
                params.push(cond[key])
            }
            return runner.exec(sql, ...params)
                .then(() => ob.notify())
        },
        delete: cond => {
            let sql = `DELETE FROM ${tableName} WHERE 1`
            const params = []
            for (const key in cond) {
                sql += ` AND ${key}=?`
                params.push(cond[key])
            }
            return runner.exec(sql, ...params)
                .then(() => ob.notify())
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
                    let sql = `SELECT * FROM ${tableName} WHERE 1`
                    const params = []
                    if (opt.equal) {
                        for (const key in opt.equal) {
                            sql += ` AND ${key}=?`
                            params.push(opt.equal[key])
                        }
                    }
                    if (opt.notEqual) {
                        for (const key in opt.notEqual) {
                            sql += ` AND ${key}<>?`
                            params.push(opt.notEqual[key])
                        }
                    }
                    if (opt.reverse) {
                        sql += ' ORDER BY id DESC'
                    }
                    if (opt.limit) {
                        sql += ' LIMIT ?, ?'
                        params.push(opt.limit.offset || 0, opt.limit.count)
                    }
                    return runner.query(sql, ...params)
                }
            }
        },
        observe: () => {
            return ob.observe()
        }
    }
}

export async function wrap(runner: SQLRunner): Promise<Storage> {
    for (const schema of schemas) {
        await runner.exec(schema)
    }

    return {
        configs: wrapTable(runner, 'configs'),
        wallets: wrapTable(runner, 'wallets'),
        activities: wrapTable(runner, 'activities'),
        transaction: async scope => {
            try {
                await runner.exec('BEGIN TRANSACTION')
                await scope()
                await runner.exec('COMMIT')
            } catch (err) {
                await runner.exec('ROLLBACK')
                throw err
            }
        },
        waitFor: p => p
    }
}
