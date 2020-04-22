declare interface DataStore {
    readonly configs: DataStore.Table<DataStore.ConfigEntity>
    readonly wallets: DataStore.Table<DataStore.WalletEntity>
    readonly activities: DataStore.Table<DataStore.ActivityEntity>

    transaction(scope: () => Promise<void>): Promise<void>
}

declare namespace DataStore {
    interface Entity {
        id: number
    }

    interface ConfigEntity extends Entity {
        key: string
        value: string
    }

    interface WalletEntity extends Entity {
        network: string
        type: string
        name: string
        glob: string
    }

    interface ActivityEntity extends Entity {
        network: string
        walletId: number
        createdTime: number
        glob: string
    }

    interface Table<T extends Entity> {
        insert(row: Partial<T>): Promise<void>
        update(cond: Partial<T>, values: Partial<T>): Promise<void>
        delete(cond: Partial<T>): Promise<void>
        all(): Query<T>
    }

    interface Query<T extends Entity> {
        where(cond: Partial<T>): this
        reverse(): this
        limit(count: number, offset?: number): this
        query(): Promise<T[]>
    }
}
