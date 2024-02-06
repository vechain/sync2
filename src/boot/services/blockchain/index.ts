import { abis } from 'src/consts'
import { createPool } from './pool'
import { commitTx } from './tx-commiter'

const VetDomainsResolverByGid: Record<string, string> = {
    // MainNet Resolver Utility
    '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': '0xA11413086e163e41901bb81fdc5617c975Fa5a1A',

    // TestNet Resolver Utility
    '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': '0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94'
}

function serve(gid: string, pool: ReturnType<typeof createPool>) {
    return {
        get thor() { return pool.get(gid).thor },
        balanceOf(addr: string, spec: M.TokenSpec) {
            if (spec.symbol === 'VET') {
                return this.thor.account(addr).get().then(a => a.balance)
            } else if (spec.symbol === 'VTHO') {
                return this.thor.account(addr).get().then(a => a.energy)
            } else {
                return this.thor.account(spec.address)
                    .method(abis.balanceOf)
                    .cache([addr])
                    .call(addr)
                    .then(output => output.decoded.balance)
            }
        },
        commitTx(raw: string) {
            commitTx(pool.resoleNode(gid).url, raw)
        },
        vetDomainsAddressesOf(names: string[]) {
            if (!VetDomainsResolverByGid[gid]) { return [] }

            const vetDomainsResolver = VetDomainsResolverByGid[gid]
            return this.thor
                .account(vetDomainsResolver)
                .method({
                    inputs: [
                        {
                            internalType: 'string[]',
                            name: 'names',
                            type: 'string[]'
                        }
                    ],
                    name: 'getAddresses',
                    outputs: [
                        {
                            internalType: 'address[]',
                            name: 'addresses',
                            type: 'address[]'
                        }
                    ],
                    stateMutability: 'view',
                    type: 'function'
                })
                .cache([])
                .call(names)
                .then(output => output.decoded.addresses)
        },
        vetDomainsNamesOf(addresses: string[]) {
            if (!VetDomainsResolverByGid[gid]) { return [] }

            const vetDomainsResolver = VetDomainsResolverByGid[gid]
            return this.thor
                .account(vetDomainsResolver)
                .method({
                    inputs: [
                        {
                            internalType: 'address[]',
                            name: 'addresses',
                            type: 'address[]'
                        }
                    ],
                    name: 'getNames',
                    outputs: [
                        {
                            internalType: 'string[]',
                            name: 'names',
                            type: 'string[]'
                        }
                    ],
                    stateMutability: 'view',
                    type: 'function'
                })
                .cache([])
                .call(addresses)
                .then(output => output.decoded.names)
        }
    }
}

export function build(resolveNode: (gid: string) => M.Node) {
    const pool = createPool(resolveNode)
    const cache = new Map<string, ReturnType<typeof serve>>()
    return (gid: string) => {
        let handler = cache.get(gid)
        if (!handler) {
            cache.set(gid, handler = serve(gid, pool))
        }
        return handler
    }
}
