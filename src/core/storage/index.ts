
export interface Storage {
    readonly configs: Storage.Table<Storage.ConfigEntity>
    readonly wallets: Storage.Table<Storage.WalletEntity>
    readonly activities: Storage.Table<Storage.ActivityEntity>

    transaction(scope: () => Promise<void>): Promise<void>
}

export namespace Storage {
    export interface Entity {
        id: number
    }

    export interface ConfigEntity extends Entity {
        key: string
        value: string
    }

    export interface WalletEntity extends Entity {
        network: string
        type: string
        name: string
        glob: string
    }

    export interface ActivityEntity extends Entity {
        network: string
        walletId: number
        createdTime: number
        glob: string
    }

    export interface Table<T extends Entity> {
        insert(row: Partial<T>): Promise<void>
        update(cond: Partial<T>, values: Partial<T>): Promise<void>
        delete(cond: Partial<T>): Promise<void>
        all(): Query<T>
    }

    export interface Query<T extends Entity> {
        where(cond: Partial<T>): this
        reverse(): this
        limit(count: number, offset?: number): this
        query(): Promise<T[]>
    }

    let instance: Storage | undefined

    export async function init(): Promise<Storage> {
        if (!instance) {
            if (process.env.MODE === 'electron') {
                instance = await (await import('./electron')).open()
            } else if (process.env.MODE === 'cordova') {
                instance = await (await import('./cordova')).open()
            } else {
                instance = await (await import('./indexdb')).open()
            }
        }
        return instance
    }
}
