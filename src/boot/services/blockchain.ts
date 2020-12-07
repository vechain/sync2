import { createThorFactory } from './utils'
import { abis } from 'src/consts'

function serve(exec: ReturnType<typeof createThorFactory>) {
    return {
        exec,
        getAccount(addr: string) {
            return exec(thor => thor.account(addr).get())
        },
        balanceOf(addr: string, spec: M.TokenSpec | 'vet' | 'vtho') {
            return exec(thor => {
                if (spec === 'vet') {
                    return thor.account(addr).get().then(a => a.balance)
                } else if (spec === 'vtho') {
                    return thor.account(addr).get().then(a => a.energy)
                } else {
                    return thor.account(spec.address)
                        .method(abis.balanceOf)
                        .cache([addr])
                        .call(addr)
                        .then(output => output.decoded.balance)
                }
            })
        }
    }
}

export function build(resolveNode: (gid: string) => Promise<M.Node>) {
    const cache = new Map<string, ReturnType<typeof serve>>()
    return (gid: string) => {
        let handler = cache.get(gid)
        if (!handler) {
            cache.set(gid, handler = serve(
                createThorFactory(gid, resolveNode)
            ))
        }
        return handler
    }
}
