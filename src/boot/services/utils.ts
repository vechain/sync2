import { Storage } from 'core/storage'
import Vue from 'vue'

function cleanKeys<T>(target: T, src: object) {
    for (const tk in target) {
        if (!(tk in src)) {
            delete (target as Record<string, unknown>)[tk]
        }
    }
    return target
}

/** make the table reactive on table change and auto transform entity from/to model */
export function delegateTable<E extends Storage.Entity, M extends Storage.Entity>(
    table: Storage.Table<E>,
    _e2m: (e: E) => M,
    _m2e: (m: Partial<M>) => Partial<E>
) {
    const e2m = (e: E) => cleanKeys(_e2m(e), e)
    const m2e = (m: Partial<M>) => cleanKeys(_m2e(m), m)

    const reactor = Vue.observable({ v: 0 })
    void (async () => {
        const ob = table.observe()
        for (; ;) {
            await ob.changed()
            reactor.v++
        }
    })()
    return {
        insert(row: Partial<M>, replace?: boolean) {
            return table.insert(m2e(row), replace)
        },
        update(cond: Partial<E>, values: Partial<M>) {
            return table.update(cond, m2e(values))
        },
        delete(cond: Partial<E>) {
            return table.delete(cond)
        },
        all() {
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
                    // touch the reactor to make table's properties be reactive
                    void reactor.v
                    return q.query().then(r => r.map(e2m))
                }
            }
        }
    }
}
