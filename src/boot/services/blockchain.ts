import { createThorFactory } from './utils'

function serve(exec: ReturnType<typeof createThorFactory>) {
    return {
        getAccount(addr: string) {
            return exec(thor => thor.account(addr).get())
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
