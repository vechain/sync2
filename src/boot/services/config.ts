import { Storage } from 'core/storage'
import { delegateTable } from './utils'
import { genesises } from 'src/consts'
import { TokenRegistry } from './token-registry'

declare global {
    type ConfigKey = 'nodes' | 'passwordShadow' | 'tokenRegistry' | 'activeTokenSymbols' | 'recentContact' | 'currentWalletId'
}

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

export function build(storage: Storage) {
    const t = delegateTable<Storage.ConfigEntity, Storage.ConfigEntity>(
        storage.configs,
        e => e,
        m => m
    )
    return {
        async get(key: ConfigKey) {
            const row = (await t.all().where({ key }).query())[0]
            return row ? row.value : ''
        },
        set(key: ConfigKey, value: string) {
            return t.insert({ key, value }, true)
        },
        // --- nodes ---
        async nodes() {
            const json = (await this.get('nodes')) || JSON.stringify(presetNodes)
            return JSON.parse(json) as M.Node[]
        },
        async activeNodes() {
            const nodes = await this.nodes()
            return nodes.reduce<Record<string, M.Node>>((prev, cur) => {
                const gid = cur.genesis.id
                if (!prev[gid]) {
                    prev[gid] = cur
                } else if (cur.active) {
                    prev[cur.genesis.id] = cur
                }
                return prev
            }, {})
        },
        // ---- tokens ---
        async tokens() {
            const json = await this.get('tokenRegistry')
            const registry: TokenRegistry = json ? JSON.parse(json) : {
                updated: 0,
                main: [],
                test: []
            }
            if (registry.updated + 6 * 60 * 60 * 1000 < Date.now()) {
                // fetch in background and don't block
                TokenRegistry.fetch()
                    .then(r => this.set('tokenRegistry', JSON.stringify(r)))
                    .catch(err => console.warn(err))
            }

            const toModel = (gid: string, entity: TokenRegistry.Entity, permanent: boolean): M.TokenSpec => {
                return {
                    gid,
                    name: entity.name,
                    symbol: entity.symbol,
                    decimals: entity.decimals,
                    address: entity.address,
                    iconSrc: entity.iconSrc || TokenRegistry.iconSrc(entity.icon),
                    permanent
                }
            }

            return [
                ...TokenRegistry.permanents.map(e => toModel(genesises.main.id, e, true)),
                ...registry.main.map(e => toModel(genesises.main.id, e, false)),
                ...TokenRegistry.permanents.map(e => toModel(genesises.test.id, e, true)),
                ...registry.test.map(e => toModel(genesises.test.id, e, false))
            ]
        },
        async activeTokenSymbols() {
            return JSON.parse((await this.get('activeTokenSymbols')) || '[]') as string[]
        },
        setActiveTokenSymbols(val: string[]) {
            return this.set('activeTokenSymbols', JSON.stringify(val))
        }
    }
}
