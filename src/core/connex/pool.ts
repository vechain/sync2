import { Framework } from '@vechain/connex-framework'
import { DriverNoVendor } from '@vechain/connex-driver/dist/driver-no-vendor'
import { SimpleNet } from '@vechain/connex-driver/dist/simple-net'

interface Instance {
    connexPromise: Promise<Connex>
    close: () => void
    node: Node
}

function newInstance(node: Node): Instance {
    let driver: DriverNoVendor | undefined
    const connexPromise = (async () => {
        const net = new SimpleNet(node.url)
        const genesis: Connex.Thor.Block = await net.http('GET', 'blocks/0')
        if (genesis.id !== node.genesisId) {
            throw new Error('genesis id mismatch')
        }

        driver = new DriverNoVendor(net, genesis)
        const framework = new Framework(driver)

        await framework.thor.block('best').get()

        return framework
    })()
    return {
        connexPromise,
        close: () => driver && driver.close(),
        node
    }
}

const instances: Record<string, Instance | undefined> = {}

interface Node {
    genesisId: string
    url: string
}

/**
 * retain a reused connex object
 * @param node the node config
 */
export async function retain(node: Node) {
    node = { ...node }
    const key = node.genesisId

    let instance = instances[key]
    if (!instance) {
        instance = newInstance(node)
        instances[key] = instance
    } else {
        if (instance.node.url !== node.url) {
            // simple close the old instance with difference url,
            // and create a new one
            instance.close()
            instance = newInstance(node)
            instances[key] = instance
        }
    }
    // TODO: shutdown idle instance

    try {
        return await instance.connexPromise
    } catch (err) {
        instance.close()
        delete instances[key]
        throw err
    }
}
