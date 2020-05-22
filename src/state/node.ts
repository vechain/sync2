import Vue from 'vue'
import { Storage } from 'core/storage'

const configKey = 'nodes'

const preset: M.Node[] = [
    { // mainnet
        gid: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
        url: 'http://localhost:8669'
    },
    { // testnet
        gid: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
        url: 'http://localhost:8669'
    }
]

type Glob = {
    nodes: M.Node[]
}

export function build() {
    const state = Vue.observable({
        glob: '',
        ready: false
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.configs.observe()
        for (; ;) {
            try {
                const entity = (await s.configs
                    .all()
                    .where({ key: configKey })
                    .query())[0]

                state.glob = entity ? entity.value : ''
                state.ready = true
            } catch (err) {
                console.warn(err)
            }
            await ob.changed()
        }
    })()
    return {
        get list(): M.Node[] {
            if (state.glob) {
                const glob = JSON.parse(state.glob) as Glob
                return [...preset, ...glob.nodes]
            }
            return [...preset]
        },
        get ready() { return state.ready }
    }
}
