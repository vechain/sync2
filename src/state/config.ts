import Vue from 'vue'
import { Storage } from 'core/storage'
import { genesises, urls } from 'src/consts'

const presetNodes: M.Node[] = [
    { // mainnet
        genesis: genesises.main,
        preset: true,
        active: true,
        url: 'https://mainnet.veblocks.net'
    },
    { // testnet
        genesis: genesises.test,
        preset: true,
        active: true,
        url: 'https://testnet.veblocks.net'
    }
]

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
                    const dbNodes = glob ? JSON.parse(glob) : []
                    if (dbNodes.length) {
                        return [...dbNodes].filter(n => n.active)
                    } else {
                        return [...presetNodes]
                    }
                },
                get all(): M.Node[] {
                    const glob = all.nodes
                    const dbNodes = glob ? JSON.parse(glob) : []
                    if (dbNodes.length) {
                        return [...dbNodes]
                    } else {
                        return [...presetNodes]
                    }
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
                get list() {
                    const ret: Array<Pick<M.TokenSpec, 'name' | 'symbol' | 'icon'>> = [];
                    [...this.registry.main, ...this.registry.test].forEach(spec => {
                        if (!ret.find(i => i.symbol === spec.symbol)) {
                            ret.push({ name: spec.name, symbol: spec.symbol, icon: spec.icon })
                        }
                    })
                    return ret
                },
                specs(gid: string, activeOnly: boolean) {
                    let specs: M.TokenSpec[] = []
                    switch (genesises.which(gid)) {
                        case 'main':
                            specs = this.registry.main
                            break
                        case 'test':
                            specs = this.registry.test
                            break
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
                        const resp = await fetch(`${urls.tokenRegistry}${net}.json`)
                        if (resp.status === 200) {
                            newRegistry[net] = (await resp.json() as Array<M.TokenSpec>).filter(spec => spec.symbol !== 'VTHO')
                        }
                    }
                    newRegistry.updated = Date.now()
                    await config.set('tokenRegistry', JSON.stringify(newRegistry))
                }
            }
        },
        get recent() {
            const all = this.all
            return {
                get addresses(): string[] {
                    return all.recentContact ? JSON.parse(all.recentContact) : []
                }
            }
        }
    }
}
