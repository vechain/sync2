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

    let activeNodesPromise = config.activeNodes()
    const bc = Blockchain.build(async (gid) => {
        return (await activeNodesPromise)[gid]
    })

    void (async () => {
        const ob = storage.configs.observe()
        for (; ;) {
            await ob.changed()
            activeNodesPromise = config.activeNodes()
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
