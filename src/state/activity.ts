import Vue from 'vue'
import { Storage } from 'core/storage'

export function build() {
    // directly hold storage entities in state
    const state = Vue.observable({
        entities: [] as Storage.ActivityEntity[],
        ready: false
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.activities.observe()
        for (; ;) {
            try {
                state.entities = await s.activities.all().query()
                state.ready = true
            } catch (err) {
                console.warn(err)
            }
            await ob.changed()
        }
    })()

    // transform storage entities into models
    return {
        get list() {
            return state.entities.map<M.Activity<'tx' | 'cert'>>(r => {
                return {
                    id: r.id,
                    gid: r.gid,
                    walletId: r.walletId,
                    createdTime: r.createdTime,
                    glob: JSON.parse(r.glob)
                }
            })
        },
        get ready() { return state.ready }
    }
}
