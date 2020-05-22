import { Framework } from '@vechain/connex-framework'
import { DriverNoVendor } from '@vechain/connex-driver/dist/driver-no-vendor'
import { SimpleNet } from '@vechain/connex-driver/dist/simple-net'

interface Node {
    gid: string
    url: string
}

interface Instance {
    connexPromise: Promise<Connex>
    destroy(): void
    refCount: number
    timer?: NodeJS.Timeout
}

function newInstance(node: Node): Instance {
    let driver: DriverNoVendor | undefined
    const connexPromise = (async () => {
        const net = new SimpleNet(node.url)
        const genesis: Connex.Thor.Block = await net.http('GET', 'blocks/0')
        if (genesis.id !== node.gid) {
            throw new Error('genesis id mismatch')
        }

        driver = new DriverNoVendor(net, genesis)
        try {
            const framework = new Framework(driver)

            const warmup = async () => {
                const ticker = framework.thor.ticker()
                while (framework.thor.status.head.number === 0) {
                    await ticker.next()
                }
            }
            // make sure the returned framework is warmed up
            await Promise.race([
                warmup(),
                new Promise(resolve => setTimeout(resolve, 20 * 1000))
                    .then(() => { throw new Error('timeout to init connex') })
            ])

            return framework
        } catch (err) {
            driver.close()
            throw err
        }
    })()

    return {
        connexPromise,
        destroy: () => { driver && driver.close() },
        refCount: 0
    }
}

const instances: Record<string, Instance> = {}

export interface ConnexRef {
    connex: Connex
    release(): void
}

/**
 * retain a reference counted reusable connex object.
 * @param node the node config
 */
export async function retain(node: Node): Promise<ConnexRef> {
    node = { ...node }
    const key = `${node.gid}|${node.url}`

    let instance = instances[key]
    if (!instance) {
        instance = newInstance(node)
        instances[key] = instance
    }

    try {
        const connex = await instance.connexPromise

        instance.refCount++
        // kill the timer when retain again, since destroying is delayed
        if (instance.timer) {
            clearTimeout(instance.timer)
            instance.timer = undefined
        }

        let releaseCalled = false
        return {
            connex,
            release: () => {
                if (releaseCalled) {
                    throw new Error('connexRef is already released')
                }
                releaseCalled = true
                instance.refCount--
                if (instance.refCount === 0) {
                    instance.timer = setTimeout(() => {
                        delete instances[key]
                        instance.destroy()
                    }, 60 * 1000)
                }
            }
        }
    } catch (err) {
        delete instances[key]
        instance.destroy()
        throw err
    }
}
