import Vue from 'vue'
import { Storage } from 'core/storage'

const configKey = 'networks'

const preset: Glob = {
    '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': {
        nodeUrl: 'http://localhost:8669',
        givenName: 'mainnet'
    },
    '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': {
        nodeUrl: 'http://localhost:8669',
        givenName: 'testnet'
    }
}

export function build() {
    const state = Vue.observable({
        glob: {} as Glob,
        ready: false
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.configs.observe()
        let lastData = '{}'
        for (; ;) {
            try {
                const entity = (await s.configs
                    .all()
                    .where({ key: configKey })
                    .query())[0]

                const data = entity ? entity.value : '{}'
                if (data !== lastData) {
                    state.glob = JSON.parse(data)
                    lastData = data
                }
                state.ready = true
            } catch (err) {
                console.warn(err)
            }
            await ob.changed()
        }
    })()
    return {
        get list() {
            const glob: Glob = {}
            // deeply merge preset with state
            for (const key in preset) {
                glob[key] = { ...preset[key] }
            }
            for (const key in state.glob) {
                glob[key] = { ...glob[key], ...state.glob[key] }
            }

            return Object.entries(glob).map<M.Network>(([k, v]) => {
                return {
                    id: k,
                    nodeUrl: v.nodeUrl,
                    name: v.givenName || 'private'
                }
            })
        },
        get ready() { return state.ready }
    }
}

type Glob = Record<string, {
    givenName?: string
    nodeUrl: string
}>
