import { boot } from 'quasar/wrappers'
import { Framework } from '@vechain/connex-framework'
import { DriverNoVendor } from '@vechain/connex-driver/dist/driver-no-vendor'
import { SimpleNet } from '@vechain/connex-driver/dist/simple-net'
import Vue from 'vue'

// this module provides the easy way to create and maintain thor object for vue components

declare module 'vue/types/vue' {
    interface Vue {
        /**
         * create a thor object, note that the previously created object will be released and might be unusable.
         * @param nodeUrl the url of thor node API
         * @param genesis the genesis block
         * @param nonReactive if set to true, the returned thor object is non-reactive
         */
        $thor(
            nodeUrl: string,
            genesis: Connex.Thor.Block,
            nonReactive?: boolean
        ): Connex.Thor
    }
}

const pool = (() => {
    type Instance = {
        driver: DriverNoVendor
        framework: Framework
        refCount: number
        reactor: unknown
        closeDelayTimer?: NodeJS.Timer
    }
    const map = new Map<string, Instance>()

    return {
        retain(nodeUrl: string, genesis: Connex.Thor.Block, nonReactive?: boolean) {
            const id = `${genesis.id}@${nodeUrl}`
            // get or create instance
            const instance = (() => {
                let inst = map.get(id)
                if (inst) {
                    inst.refCount++
                    return inst
                }
                const driver = new DriverNoVendor(new SimpleNet(nodeUrl), genesis)
                const framework = new Framework(driver)

                // key codes to make thor object be reactive on beats of blockchain
                const reactObj = Vue.observable({ val: '' })
                void (async () => {
                    const ticker = framework.thor.ticker()
                    for (; ;) {
                        reactObj.val = (await ticker.next()).id
                    }
                })()
                map.set(id, inst = {
                    driver,
                    framework,
                    refCount: 1,
                    get reactor() { return reactObj.val }
                })
                console.log(`[connex.thor] created ${id}`)
                return inst
            })()

            instance.closeDelayTimer && clearTimeout(instance.closeDelayTimer)
            instance.closeDelayTimer = undefined

            let releaseCalled = false
            return {
                get thor() {
                    if (nonReactive) {
                        return instance.framework.thor
                    }
                    return new Proxy(instance.framework.thor, {
                        get(target, prop, receiver) {
                            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                            const _ = instance.reactor // touch the reactor to make thor's properties be reactive
                            return Reflect.get(target, prop, receiver)
                        }
                    })
                },
                release() {
                    if (releaseCalled) {
                        throw new Error('thor ref already released')
                    }
                    releaseCalled = true
                    if (--instance.refCount === 0) {
                        // put a delay on destroy
                        instance.closeDelayTimer = setTimeout(() => {
                            map.delete(id)
                            instance.driver.close()
                            console.log(`[connex.thor] destroyed ${id}`)
                        }, 30 * 1000)
                    }
                }
            }
        }
    }
})()

export default boot(({ Vue }) => {
    const exclusion = new WeakMap<Vue, ReturnType<typeof pool.retain>>()
    Object.defineProperty(Vue.prototype, '$thor', {
        get(): Vue['$thor'] {
            const vm = this as Vue
            return (nodeUrl, genesis, nonReactive) => {
                const oldRef = exclusion.get(vm)
                if (oldRef) {
                    oldRef.release()
                } else {
                    vm.$once('hook:destroyed', () => {
                        exclusion.get(vm)!.release()
                    })
                }
                const newRef = pool.retain(nodeUrl, genesis, nonReactive)
                exclusion.set(vm, newRef)
                return newRef.thor
            }
        }
    })
})
