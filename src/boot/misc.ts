import { boot } from 'quasar/wrappers'
import * as State from 'src/state'
import { BioPass } from 'src/utils/bio-pass'

declare module 'vue/types/vue' {
    interface Vue {
        $state: ReturnType<typeof State.build>
        $bioPass: BioPass | null
    }
}

export default boot(async ({ Vue }) => {
    const state = State.build()

    Object.defineProperty(Vue.prototype, '$state', {
        get() { return state }
    })

    const bioPass = await BioPass.init('main')
    Object.defineProperty(Vue.prototype, '$bioPass', {
        get() { return bioPass }
    })
})
