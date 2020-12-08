import { Storage } from 'core/storage'
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
