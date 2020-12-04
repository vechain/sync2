import { Storage } from 'core/storage'
import { Framework } from '@vechain/connex-framework'
import { DriverNoVendor, SimpleNet } from '@vechain/connex-driver'
import Vue from 'vue'

/** make the table reactive on table change and auto transform entity from/to model */
export function delegateTable<E extends Storage.Entity, M extends Storage.Entity>(
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

export function createThorFactory(gid: string, resolveNode: (gid: string) => Promise<M.Node>) {
    type Instance = {
        thor: Connex.Thor
        driver: DriverNoVendor
        lastAccessTime: number
        refCount: number
    }

    const cache = new Map<string, Instance>() // url => instance

    const reactor = Vue.observable({ v: '' })
    const getOrCreateInstance = async () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const _ = reactor.v // touch to be reactive

        const node = await resolveNode(gid)
        let instance = cache.get(node.url)
        if (instance) {
            instance.lastAccessTime = Date.now()
        } else {
            const driver = new DriverNoVendor(new SimpleNet(node.url), node.genesis)
            const framework = new Framework(driver)
            console.log(`[connex.thor] created ${node.genesis.id}@${node.url}`)
            // react on blockchain tick
            void (async () => {
                const ticker = framework.thor.ticker()
                for (; ;) {
                    reactor.v = (await ticker.next()).id

                    const now = Date.now()
                    Array.from(cache.entries()).forEach(([k, v]) => {
                        if (v.refCount === 0 && v.lastAccessTime + 60 * 1000 < now) {
                            console.log(`[connex.thor] destroyed ${node.genesis.id}@${node.url}`)
                            v.driver.close()
                            cache.delete(k)
                        }
                    })
                }
            })()
            cache.set(node.url, instance = {
                thor: new Proxy(framework.thor, {
                    get(target, prop, receiver) {
                        instance!.lastAccessTime = Date.now()
                        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                        const _ = reactor.v // touch the reactor to make thor's properties be reactive
                        return Reflect.get(target, prop, receiver)
                    }
                }),
                driver,
                lastAccessTime: Date.now(),
                refCount: 0
            })
        }
        return instance
    }

    return async <T>(proc: (thor: Connex.Thor) => Promise<T>) => {
        const instance = await getOrCreateInstance()
        try {
            instance.refCount++
            return await proc(instance.thor)
        } finally {
            instance.refCount--
        }
    }
}
