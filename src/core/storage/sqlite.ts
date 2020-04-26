import type { Storage } from './index'
const schema =
    `CREATE TABLE IF NOT EXISTS configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    value TEXT
);

CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    network TEXT NOT NULL,  
    vault TEXT
    meta TEXT  
);
CREATE INDEX IF NOT EXISTS wallets_i0 ON wallets(network);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    network TEXT NOT NULL, 
    walletId INTEGER NOT NULL,
    createdTime INTEGER NOT NULL,
    glob TEXT
);
CREATE INDEX IF NOT EXISTS activities_i0 ON activities(network, walletId, createdTime);
`

export interface SQLRunner {
    query<T extends Storage.Entity>(sql: string, ...params: unknown[]): Promise<T[]>
    exec(sql: string, ...params: unknown[]): Promise<void>
}

function wrapTable<T extends Storage.Entity>(runner: SQLRunner, tableName: string): Storage.Table<T> {
    return {
        insert: row => {
            const keys = []
            const values = []
            for (const key in row) {
                keys.push(key)
                values.push(row[key])
            }
            return runner.exec(`INSERT INTO ${tableName} (${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`,
                ...values)
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
        },
        delete: cond => {
            let sql = `DELETE FROM ${tableName} WHERE 1`
            const params = []
            for (const key in cond) {
                sql += ` AND ${key}=?`
                params.push(cond[key])
            }
            return runner.exec(sql, ...params)
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
                    let sql = `SELECT * FROM ${tableName} WHERE 1`
                    const params = []
                    if (opt.cond) {
                        for (const key in opt.cond) {
                            sql += ` AND ${key}=?`
                            params.push(opt.cond[key])
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
        }
    }
}

export async function wrap(runner: SQLRunner): Promise<Storage> {
    await runner.exec(schema)
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
        }
    }
}
