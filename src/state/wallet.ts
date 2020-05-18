import Vue from 'vue'
import { Storage } from 'core/storage'

export function build() {
    const state = Vue.observable({
        items: [] as M.Wallet[],
        currentIndex: 0
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.wallets.observe()
        for (; ;) {
            try {
                const rows = await s.wallets.all().query()
                state.items = rows.map(r => ({
                    id: r.id,
                    network: r.network,
                    vault: r.vault,
                    meta: JSON.parse(r.meta)
                }))
            } catch (err) {
                console.warn(err)
            }
            await ob.changed()
        }
    })()

    return {
        get items() { return state.items },
        get current() {
            const i = state.currentIndex
            if (i >= 0 && i < state.items.length) {
                return state.items[i]
            }
            return null
        },
        setCurrentIndex(i: number) {
            state.currentIndex = i
        }
    }
}
