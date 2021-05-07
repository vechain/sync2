import { Storage } from 'core/storage'
import { delegateTable } from '../utils'
import { genesises } from 'src/consts'
import { TokenRegistry } from './token-registry'
import { unique } from 'src/utils/array'

const presetNodes: M.Node[] = [
    { // mainnet
        genesis: genesises.main,
        preset: true,
        url: 'https://sync-mainnet.veblocks.net'
    },
    { // testnet
        genesis: genesises.test,
        preset: true,
        url: 'https://sync-testnet.veblocks.net'
    }
]

export function build(storage: Storage) {
    const t = delegateTable<Storage.ConfigEntity, Storage.ConfigEntity>(
        storage.configs,
        e => e,
        m => m
    )
    type Key = 'nodes' | 'activeNodeMap' | 'userMasterKeyGlob' |
        'tokenRegistry' | 'activeTokenSymbols' | 'recentRecipients' | 'language' | 'bio-pass-on'

    const getSubKey = async (key: Key, subKey: string) => {
        const row = (await t.all().where({ key, subKey }).query())[0]
        return row ? row.value : ''
    }
    const setSubKey = (key: Key, subKey: string, value: string) => {
        return t.insert({ key, subKey, value }, true).then(() => { })
    }

    const get = (key: Key) => getSubKey(key, '')
    const set = (key: Key, value: string) => setSubKey(key, '', value)

    const node = {
        async all(): Promise<M.Node[]> {
            // prepend preset nodes
            return [
                ...JSON.parse(JSON.stringify(presetNodes)),
                ...JSON.parse(await get('nodes') || '[]')
            ]
        },
        save(val: M.Node[]) {
            // exclude preset nodes
            return set('nodes', JSON.stringify(val.filter(n => !n.preset)))
        },
        async activeMap() {
            return JSON.parse(await get('activeNodeMap') || '{}') as Record<string, string>
        },
        saveActiveMap(val: Record<string, string>) {
            return set('activeNodeMap', JSON.stringify(val))
        }
    }

    const token = {
        async all(): Promise<M.TokenSpec[]> {
            const [json, nodes] = await Promise.all([get('tokenRegistry'), node.all()])
            const registry: TokenRegistry = json ? JSON.parse(json) : {
                updated: 0,
                main: [],
                test: []
            }
            if (registry.updated + 6 * 60 * 60 * 1000 < Date.now()) {
                // fetch in background and don't block
                TokenRegistry.fetch()
                    .then(r => set('tokenRegistry', JSON.stringify(r)))
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

            const gids = unique(nodes.map(n => n.genesis.id))
            return ([] as M.TokenSpec[]).concat(
                ...gids.map(gid => TokenRegistry.permanents.map(e => toModel(gid, e, true))),
                registry.main.map(e => toModel(genesises.main.id, e, false)),
                registry.test.map(e => toModel(genesises.test.id, e, false))
            )
        },
        async activeSymbols() {
            return JSON.parse((await get('activeTokenSymbols')) || '[]') as string[]
        },
        saveActiveSymbols(val: string[]) {
            val = Array.from(new Set(val))
            return set('activeTokenSymbols', JSON.stringify(val))
        }
    }
    return {
        get node() { return node },
        get token() { return token },
        getUserMasterKeyGlob() {
            return get('userMasterKeyGlob')
        },
        setUserMasterKeyGlob(val: string) {
            return set('userMasterKeyGlob', val)
        },
        getRecentRecipients(gid: string) {
            return getSubKey('recentRecipients', gid).then(r => JSON.parse(r || '[]') as string[])
        },
        saveRecentRecipients(gid: string, val: string[]) {
            return setSubKey('recentRecipients', gid, JSON.stringify(val))
        },
        getLanguage() {
            return get('language')
        },
        saveLanguage(lang: string) {
            return set('language', lang)
        },
        getBioPassOn() {
            return get('bio-pass-on').then(r => !!r)
        },
        setBioPassOn(on: boolean) {
            return set('bio-pass-on', on ? 't' : '')
        }
    }
}
