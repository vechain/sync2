
/**
 * Storage allows to persistently store local data.
 */
export interface Storage {
    /** the table to store config items */
    readonly configs: Storage.Table<Storage.ConfigEntity>
    /** the table to store wallets */
    readonly wallets: Storage.Table<Storage.WalletEntity>
    /** the table to store wallet activities */
    readonly activities: Storage.Table<Storage.ActivityEntity>

    /**
     * perform transactional operations.
     * @param scope in which all operations will be executed exclusively
     */
    transaction(scope: () => Promise<void>): Promise<void>

    /**
     * wrap non-db async operation in transaction scope. it's important for index db.
     * @param p
     */
    waitFor<T>(p: Promise<T>): Promise<T>
}

export namespace Storage {
    /** the basic entity */
    export interface Entity {
        id: number
    }

    /** the config entity */
    export interface ConfigEntity extends Entity {
        key: string // config key
        value: string // config value
    }

    /** the wallet entity */
    export interface WalletEntity extends Entity {
        gid: string // the genesis id bound to
        vault: string // encoded vault
        meta: string // wallet meta data
    }

    /** the wallet activity entity */
    export interface ActivityEntity extends Entity {
        gid: string // the genesis id bound to
        walletId: number // related wallet id
        createdTime: number
        status: '' | 'completed'
        glob: string // the JSON encoded glob contains activity detail
    }

    /** describes table methods */
    export interface Table<T extends Entity> {
        /**
         * insert or replace a row
         * @param row the row
         * @param replace use upsert
         */
        insert(row: Partial<T>, replace?: boolean): Promise<void>

        /**
         * update rows that match the given condition
         * @param cond the condition
         * @param values the new values
         */
        update(cond: Partial<T>, values: Partial<T>): Promise<void>

        /**
         * delete rows that match the given condition
         * @param cond the condition
         */
        delete(cond: Partial<T>): Promise<void>

        /**
         * create a querier to filter result set upon all rows
         */
        all(): Querier<T>

        /**
         * create an observer to watch table change
         */
        observe(): Observer
    }

    /** the table observer */
    export interface Observer {
        changed(): Promise<void>
    }

    /** the querier */
    export interface Querier<T extends Entity> {
        /**
         * apply where equal condition
         * @param cond the condition
         */
        where(cond: Partial<T>): this

        /**
         * apply where not equal condition
         * @param cond the condition
         */
        except(cond: Partial<T>): this

        /** reverse the result set, before limit operation */
        reverse(): this

        /**
         * limit the result set
         * @param count max count of rows in result set
         * @param offset the offset
         */
        limit(count: number, offset?: number): this

        /** perform query */
        query(): Promise<T[]>
    }

    let cachedInstance: Promise<Storage> | undefined

    /** initialize(only once) the storage. */
    export async function init(): Promise<Storage> {
        if (!cachedInstance) {
            cachedInstance = (async () => {
                if (process.env.MODE === 'electron') {
                    return (await import('./electron')).open()
                } else if (process.env.MODE === 'cordova') {
                    return (await import('./cordova')).open()
                } else {
                    return (await import('./indexdb')).open()
                }
            })()
        }
        return cachedInstance
    }
}
