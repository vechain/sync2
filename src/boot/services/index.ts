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

    let activeNodes = await config.node.actives()
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
            activeNodes = await config.node.actives()
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
