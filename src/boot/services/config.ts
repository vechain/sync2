import { Storage } from 'core/storage'
import { delegateTable } from './utils'
import { genesises } from 'src/consts'

declare global {
    type ConfigKey = 'nodes' | 'passwordShadow' | 'tokenRegistry' | 'activeTokens' | 'recentContact' | 'currentWalletId'
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
        async nodes() {
            const json = await this.get('nodes')
            if (json) {
                return JSON.parse(json) as M.Node[]
            }
            return [...presetNodes]
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
        }
    }
}
