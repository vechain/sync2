import Vue from 'vue'
import { Storage } from 'core/storage'

const configKeyNodes = 'nodes'

const presetNodes: M.Node[] = [
    { // mainnet
        gid: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
        url: 'http://localhost:8669'
    },
    { // testnet
        gid: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
        url: 'http://localhost:8669'
    }
]

export function build() {
    const state = Vue.observable({
        records: {} as Record<string, string>,
        ready: false
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.configs.observe()
        for (; ;) {
            try {
                const entities = await s.configs.all().query()
                state.records = entities.reduce<Record<string, string>>((r, e) => {
                    r[e.key] = e.value
                    return r
                }, {})
                state.ready = true
            } catch (err) {
                console.warn(err)
            }
            await ob.changed()
        }
    })()

    return {
        get ready() { return state.ready },
        get node() {
            return {
                get list(): M.Node[] {
                    const glob = state.records[configKeyNodes]
                    if (glob) {
                        try {
                            return [...presetNodes, ...JSON.parse(glob)]
                        } catch (err) {
                            console.warn(err)
                        }
                    }
                    return [...presetNodes]
                }
            }
        }
    }
}
