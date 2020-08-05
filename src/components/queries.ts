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
