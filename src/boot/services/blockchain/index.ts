import { abis } from 'src/consts'
import { createPool } from './pool'
import { commitTx } from './tx-commiter'
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
