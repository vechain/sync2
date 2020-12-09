import axios from 'axios'

export type TokenRegistry = {
    updated: number
    main: TokenRegistry.Entity[]
    test: TokenRegistry.Entity[]
}

export namespace TokenRegistry {
    const url = 'https://vechain.github.io/token-registry/'

    export type Entity = {
        name: string
        symbol: string
        decimals: number
        address: string
        icon: string
        iconSrc?: string
    }

    export const permanents: Entity[] = [
        {
            name: 'VeChain',
            symbol: 'VET',
            address: '',
            decimals: 18,
            icon: '',
            iconSrc: require('assets/vet.svg')
        },
        {
            symbol: 'VTHO',
            name: 'VeChain Thor',
            address: '0x0000000000000000000000000000456e65726779',
            decimals: 18,
            icon: '',
            iconSrc: require('assets/vtho.svg')
        }
    ]

    export async function fetch(): Promise<TokenRegistry> {
        const nets = ['main', 'test']
        const result = await Promise.all(nets.map(async net => {
            const resp = await axios.get(`${url}${net}.json`, { transformResponse: data => data, timeout: 30 * 1000 })
            return (JSON.parse(resp.data) as TokenRegistry.Entity[]).filter(t => t.symbol !== 'VTHO')
        }))
        return {
            updated: Date.now(),
            main: result[0],
            test: result[1]
        }
    }

    export function iconSrc(icon: string) {
        return `${url}assets/${icon}`
    }
}
