import { boot } from 'quasar/wrappers'
import * as State from 'src/state'

declare module 'vue/types/vue' {
    interface Vue {
        $state: ReturnType<typeof State.build>
    }
}

export default boot(({ Vue }) => {
    const state = State.build()

    Object.defineProperty(Vue.prototype, '$state', {
        get() { return state }
    })
})
