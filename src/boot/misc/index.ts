import { boot } from 'quasar/wrappers'
import * as State from './state'
import * as Plugins from './plugins'
import * as Modals from './modals'
import { genesises } from 'src/consts'

declare module 'vue/types/vue' {
    interface Vue {
        /** navigate back or go to home(/) if stack empty */
        $backOrHome(): void
        /** returns the display name of network identified by gid */
        $netDisplayName(gid: string): string
        /** it wraps window.addEventListener binding to vue component's life-cycle */
        $onWindowEvent(event: keyof WindowEventMap, listener: EventListenerOrEventListenerObject): void
    }
}

export default boot(({ Vue }) => {
    State.boot()
    Plugins.boot()
    Modals.boot()

    Object.defineProperties(Vue.prototype, {
        $backOrHome: {
            get() {
                const vm = this as Vue
                return () => {
                    vm.$stack.canGoBack
                        ? vm.$router.back()
                        : vm.$router.replace('/')
                }
            }
        },
        $netDisplayName: {
            get(): Vue['$netDisplayName'] {
                const vm = this as Vue
                return gid => {
                    switch (gid) {
                        case genesises.main.id: return vm.$t('common.mainnet').toString()
                        case genesises.test.id: return vm.$t('common.testnet').toString()
                        default: {
                            const name = vm.$t('common.private').toString()
                            const suffix = gid ? `-${gid.slice(-6)}` : ''
                            return name + suffix
                        }
                    }
                }
            }
        },
        $onWindowEvent: {
            get(): Vue['$onWindowEvent'] {
                const vm = this as Vue
                return (event, listener) => {
                    vm.$once('hook:beforeDestroy', () => {
                        window.removeEventListener(event, listener)
                    })
                    window.addEventListener(event, listener)
                }
            }
        }
    })
})
