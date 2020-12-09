import { Framework } from '@vechain/connex-framework'
import { DriverNoVendor, SimpleNet } from '@vechain/connex-driver'
import { abis } from 'src/consts'
import Vue from 'vue'

function createPool(resolveNode: (gid: string) => M.Node) {
    type Instance = {
        thor: Connex.Thor
        driver: DriverNoVendor
        lastAccessTime: number
    }
    const pool = new Map<string, Instance>() // maps node sig to instance

    const nodeReactor = Vue.observable<Record<string, string>>({}) // maps gid to node sig
    const tickReactor = Vue.observable<Record<string, string>>({}) // maps sig to head

    return {
        get(gid: string) {
            const node = resolveNode(gid)
            const sig = `${node.genesis.id}@${node.url}`

            let inst = pool.get(sig)
            if (inst) {
                inst.lastAccessTime = Date.now()
            } else {
                const driver = new DriverNoVendor(new SimpleNet(node.url), node.genesis)
                const framework = new Framework(driver)
                console.log(`[connex.thor] created ${sig}`)
                pool.set(sig, inst = {
                    thor: new Proxy(framework.thor, {
                        get(target, prop, receiver) {
                            inst!.lastAccessTime = Date.now()
                            return Reflect.get(target, prop, receiver)
                        }
                    }),
                    driver,
                    lastAccessTime: Date.now()
                })
                Vue.set(tickReactor, sig, '')
                let closed = false
                void (async () => {
                    const ticker = framework.thor.ticker()

                    // eslint-disable-next-line no-unmodified-loop-condition
                    while (!closed) {
                        let timer
                        const head = await Promise.race([
                            ticker.next().then(r => r.id),
                            new Promise(resolve => {
                                timer = setTimeout(() => resolve(Date.now().toString()), 30 * 1000)
                            })])
                        clearTimeout(timer)
                        Vue.set(tickReactor, sig, head)
                    }
                })()
                const cleaner = setInterval(() => {
                    if (inst!.lastAccessTime + 90 * 1000 < Date.now()) {
                        clearInterval(cleaner)
                        inst!.driver.close()
                        pool.delete(sig)
                        closed = true
                        console.log(`[connex.thor] destroyed ${node.genesis.id}@${node.url}`)
                    }
                }, 30 * 1000)
            }
            Vue.set(nodeReactor, gid, sig)

            // touch to be reactive on node change / blockchain ticks
            void (nodeReactor[gid], tickReactor[sig])
            return inst
        }
    }
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
