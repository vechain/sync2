import { boot } from 'quasar/wrappers'
import * as State from 'src/state'
import { BioPass } from 'src/utils/bio-pass'
import AuthenticationDialog from 'pages/AuthenticationDialog.vue'

declare module 'vue/types/vue' {
    interface Vue {
        $state: ReturnType<typeof State.build>
        $bioPass: BioPass | null
        $authenticate<T>(task: (password: string) => Promise<T>): Promise<T>
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

    Object.defineProperty(Vue.prototype, '$authenticate', {
        get(): Vue['$authenticate'] {
            const vm = this as Vue
            return task => {
                return new Promise((resolve, reject) => {
                    vm.$q.dialog({
                        component: AuthenticationDialog,
                        parent: vm,
                        task
                    })
                        .onOk(resolve)
                        .onCancel(() => reject(new Error('cancelled')))
                })
            }
        }
    })
})
