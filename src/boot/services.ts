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

function buildWalletService(t: Storage['wallets']) {
    const mt = magicTable<Storage.WalletEntity, M.Wallet>(
        t,
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

function build(storage: Storage) {
    return {
        wallet: buildWalletService(storage.wallets)
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $svc: ReturnType<typeof build>
    }
}

export default boot(async ({ Vue }) => {
    const service = build(await Storage.init())

    Object.defineProperties(Vue.prototype, {
        $svc: {
            get() { return service }
        }
    })
})
