import { boot } from 'quasar/wrappers'
import { Storage } from 'core/storage'
import Vue from 'vue'

/** make the table reactive on table change and auto transform entity from/to model */
function magicTable<E extends Storage.Entity, M extends Storage.Entity>(
    table: Storage.Table<E>,
    e2m: (e: E) => M,
    m2e: (m: Partial<M>) => Partial<E>
) {
    const reactor = Vue.observable({ v: 0 })
    void (async () => {
        const ob = table.observe()
        for (; ;) {
            await ob.changed()
            reactor.v++
        }
    })()
    return {
        insert: (row: Partial<M>, replace?: boolean) => {
            return table.insert(m2e(row), replace)
        },
        update: (cond: Partial<E>, values: Partial<M>) => {
            return table.update(cond, m2e(values))
        },
        delete: (cond: Partial<E>) => {
            return table.delete(cond)
        },
        all: () => {
            const q = table.all()
            return {
                where(cond: Partial<E>) {
                    q.where(cond)
                    return this
                },
                except(cond: Partial<E>) {
                    q.except(cond)
                    return this
                },
                reverse() {
                    q.reverse()
                    return this
                },
                limit(count: number, offset?: number) {
                    q.limit(count, offset)
                    return this
                },
                query() {
                    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                    const _ = reactor.v // touch the reactor to make table's properties be reactive
                    return q.query().then(r => r.map(e2m))
                }
            }
        }
    }
}

declare global {
    type ConfigKey = 'nodes' | 'passwordShadow' | 'tokenRegistry' | 'activeTokens' | 'recentContact'
}

function buildConfigService(storage: Storage) {
    const mt = magicTable<Storage.ConfigEntity, Storage.ConfigEntity>(
        storage.configs,
        e => e,
        m => m
    )
    return {
        byKey(key: ConfigKey) {
            return mt.all().where({ key }).query()
        },
        set(key: ConfigKey, value: string) {
            return mt.insert({ key, value }, true)
        }
    }
}

function buildWalletService(storage: Storage) {
    const mt = magicTable<Storage.WalletEntity, M.Wallet>(
        storage.wallets,
        e => ({
            id: e.id,
            gid: e.gid,
            vault: e.vault,
            meta: JSON.parse(e.meta)
        }),
        m => ({
            id: m.id,
            gid: m.gid,
            vault: m.vault,
            meta: m.meta && JSON.stringify(m.meta)
        }))

    return {
        all() { return mt.all().query() },
        byId(id: number) {
            return mt.all()
                .where({ id })
                .query()
                .then(r => r[0] || null)
        }

    }
}

function buildActivityService(storage: Storage) {
    const mt = magicTable<Storage.ActivityEntity, M.Activity<'tx' | 'cert'>>(
        storage.activities,
        e => ({
            id: e.id,
            gid: e.gid,
            walletId: e.walletId,
            createdTime: e.createdTime,
            status: e.status,
            glob: JSON.parse(e.glob)
        }),
        m => ({
            id: m.id,
            gid: m.gid,
            walletId: m.walletId,
            createdTime: m.createdTime,
            status: m.status,
            glob: m.glob && JSON.stringify(m.glob)
        })
    )
    return {
        uncompleted() {
            return mt.all().except({ status: 'completed' }).query()
        }
    }
}

function build(storage: Storage) {
    return {
        config: buildConfigService(storage),
        wallet: buildWalletService(storage),
        activity: buildActivityService(storage)
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $service: ReturnType<typeof build>
    }
}

export default boot(async ({ Vue }) => {
    const service = build(await Storage.init())

    Object.defineProperties(Vue.prototype, {
        $service: {
            get() { return service }
        }
    })
})
