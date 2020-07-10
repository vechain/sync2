import Vue from 'vue'
import { Storage } from 'core/storage'

const genesisIds = {
    main: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
    test: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
}

const presetNodes: M.Node[] = [
    { // mainnet
        gid: genesisIds.main,
        url: 'http://localhost:8669'
    },
    { // testnet
        gid: genesisIds.test,
        url: 'http://localhost:8669'
    }
]
const tokenRegistryBaseUrl = 'https://vechain.github.io/token-registry'

type TokenRegistry = {
    updated: number
    main: M.TokenSpec[]
    test: M.TokenSpec[]
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
                get registry(): TokenRegistry {
                    if (!config.all.tokenRegistry) {
                        return {
                            updated: 0,
                            main: [],
                            test: []
                        }
                    }
                    return JSON.parse(config.all.tokenRegistry)
                },
                /** returns an array of token symbols */
                get active() {
                    return config.all.activeTokens ? JSON.parse(config.all.activeTokens) as string[] : []
                },
                get list(): Array<{ name: string, symbol: string }> {
                    // map symbol to name
                    const map = [...this.registry.main, ...this.registry.test]
                        .reduce<Record<string, string>>((map, spec) => {
                            map[spec.symbol] = spec.name
                            return map
                        }, {})

                    return Object.entries(map).map(e => ({ symbol: e[0], name: e[1] }))
                },
                specs(gid: string, activeOnly: boolean) {
                    let specs: M.TokenSpec[] = []
                    if (gid === genesisIds.main) {
                        specs = this.registry.main
                    } else if (gid === genesisIds.test) {
                        specs = this.registry.test
                    }
                    const active = this.active
                    return activeOnly
                        ? specs.filter(s => active.includes(s.symbol))
                        : [...specs]
                },
                async fetch(enforce?: boolean) {
                    if (!enforce) {
                        const updated = this.registry.updated
                        if (updated && updated > Date.now() - 6 * 60 * 60 * 1000) {
                            return
                        }
                    }

                    const newRegistry = { ...this.registry }

                    const nets: Array<'main' | 'test'> = ['main', 'test']

                    for (const net of nets) {
                        const resp = await fetch(`${tokenRegistryBaseUrl}/${net}.json`)
                        if (resp.status === 200) {
                            newRegistry[net] = (await resp.json() as Array<M.TokenSpec>).filter(spec => spec.symbol !== 'VTHO')
                        }
                    }
                    newRegistry.updated = Date.now()
                    await config.set('tokenRegistry', JSON.stringify(newRegistry))
                }
            }
        }
    }
}

declare global {
    type ConfigKey = 'nodes' | 'passwordShadow' | 'tokenRegistry' | 'activeTokens'
}
