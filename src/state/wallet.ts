import Vue from 'vue'
import { Storage } from 'core/storage'

export function build() {
    // directly hold storage entities in state
    const state = Vue.observable({
        entities: [] as Storage.WalletEntity[],
        currentId: 0,
        ready: false
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.wallets.observe()
        for (; ;) {
            try {
                state.entities = await s.wallets.all().query()
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
            return state.entities.map<M.Wallet>(r => ({
                id: r.id,
                network: r.network,
                vault: r.vault,
                meta: JSON.parse(r.meta)
            }))
        },
        get current() {
            return this.list.find(item => {
                return item.id === state.currentId
            })
        },
        setCurrentId(id: number) {
            state.currentId = id
        },
        get ready() { return state.ready }
    }
}
