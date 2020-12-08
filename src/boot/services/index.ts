import { boot } from 'quasar/wrappers'
import { Storage } from 'core/storage'
import * as Blockchain from './blockchain'
import * as Config from './config'
import * as Wallet from './wallet'
import * as Activity from './activity'

type Service = {
    bc: ReturnType<typeof Blockchain.build>
    config: ReturnType<typeof Config.build>
    wallet: ReturnType<typeof Wallet.build>
    activity: ReturnType<typeof Activity.build>
}

declare module 'vue/types/vue' {
    interface Vue {
        $svc: Service
    }
}

export default boot(async ({ Vue }) => {
    const storage = await Storage.init()

    const config = Config.build(storage)
    const wallet = Wallet.build(storage)
    const activity = Activity.build(storage)

    const getActiveNodes = async () => {
        const [all, map] = await Promise.all([config.node.all(), config.node.activeMap()])
        const added = new Set<string>()
        return all.filter(n => {
            if (added.has(n.genesis.id)) {
                return false
            }
            if (map[n.genesis.id] === n.url || !map[n.genesis.id]) {
                added.add(n.genesis.id)
                return true
            }
            return false
        })
    }

    let activeNodes = await getActiveNodes()
    const bc = Blockchain.build(gid => {
        const node = activeNodes.find(n => n.genesis.id === gid)
        if (!node) {
            throw new Error('no proper node found')
        }
        return node
    })

    // watch and update active nodes
    void (async () => {
        const ob = storage.configs.observe()
        for (; ;) {
            await ob.changed()
            activeNodes = await getActiveNodes()
        }
    })()

    Object.defineProperties(Vue.prototype, {
        $svc: {
            get(): Service {
                return {
                    bc,
                    config,
                    wallet,
                    activity
                }
            }
        }
    })
})
