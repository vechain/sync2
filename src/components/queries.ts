import { abis } from '../consts'

/**
 * fetch vip180 token balance for given address
 * @param connex the connex object
 * @param addr the address
 * @param spec token spec
 * @returns balance value
 */
export function tokenBalanceOf(connex: Connex, addr: string, spec: M.TokenSpec): Promise<string> {
    return connex
        .thor
        .account(spec.address)
        .method(abis.balanceOf)
        .cache([addr])
        .call(addr)
        .then(output => output.decoded!.balance)
}

const paramsCache: Record<string, string> = {}

export async function getParams(connex: Connex, key: string): Promise<string> {
    const k = `${connex.thor.genesis.id}-${key}`
    if (paramsCache[k]) {
        return paramsCache[k]
    } else {
        const address = '0x0000000000000000000000000000506172616d73'
        const result = await connex.thor
            .account(address)
            .method(abis.paramsGet)
            .cache([address])
            .call(key)

        paramsCache[k] = result.data
        return result.data
    }
}
