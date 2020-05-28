import Vue from 'vue'
import { Storage } from 'core/storage'

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
const tokenApi = 'https://vechain.github.io/token-registry'

type AllTokens = {
    updated: number
    main: M.Token[]
    test: M.Token[]
}

export function build() {
    const state = Vue.observable({
        entities: [] as Storage.ConfigEntity[],
        ready: false
    });

    (async () => {
        const s = await Storage.init()
        const ob = s.configs.observe()
        for (; ;) {
            try {
                state.entities = await s.configs.all().query()
                state.ready = true
            } catch (err) {
                console.warn(err)
            }
            await ob.changed()
        }
    })()

    return {
        get ready() { return state.ready },
        get all() {
            return state.entities.reduce<Record<string, string>>((r, e) => {
                r[e.key] = e.value
                return r
            }, {}) as Record<ConfigKey, string>
        },
        async set(key: ConfigKey, value: string) {
            const s = await Storage.init()
            await s.configs.insert({ key, value }, true)
        },
        get node() {
            const all = this.all
            return {
                get list(): M.Node[] {
                    const glob = all.nodes
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
        },
        get token() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const config = this
            return {
                get all(): AllTokens | undefined {
                    if (config.all.tokens) {
                        return JSON.parse(config.all.tokens)
                    }
                },
                get active() {
                    return config.all.activeTokens ? JSON.parse(config.all.activeTokens) as string[] : []
                },
                get distinctList() {
                    if (this.all) {
                        const { main, test } = { ...this.all }
                        const result = new Map<string, {
                            name: string,
                            symbol: string
                        }>()

                        main.concat(test).map(item => {
                            result.set(item.symbol, {
                                name: item.name,
                                symbol: item.symbol
                            })
                        })

                        return Array.from(result.values())
                    } else {
                        return []
                    }
                },
                getList(gid: string) {
                    const gids = presetNodes.map(item => { return item.gid })
                    if (this.all && gids.includes(gid)) {
                        return gid === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a' ? this.all.main : this.all.test
                    } else {
                        return []
                    }
                },
                async fetch() {
                    if (this.all) {
                        const { updated } = { ...this.all }
                        if (updated && updated > Date.now() - 6 * 60 * 60 * 1000) {
                            return
                        }
                    }
                    const nets = ['main', 'test']
                    const tokens: {
                        [k: string]: M.Token[]
                    } = {
                        main: [],
                        test: []
                    }
                    for (const net of nets) {
                        const resp = await fetch(`${tokenApi}/${net}.json`)
                        if (resp.status !== 200) {
                            tokens[net] = []
                            return
                        }
                        const list = await resp.json()
                        list.shift()
                        tokens[net] = list
                    }
                    const allTokens: AllTokens = {
                        updated: Date.now(),
                        main: tokens.main,
                        test: tokens.test
                    }
                    await config.set('tokens', JSON.stringify(allTokens))
                }
            }
        }
    }
}

declare global {
    type ConfigKey = 'nodes' | 'passwordShadow' | 'tokens' | 'activeTokens'
}
