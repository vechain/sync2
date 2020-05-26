import { boot } from 'quasar/wrappers'
import * as State from 'src/state'
import { BioPass } from 'src/utils/bio-pass'
import AuthenticationDialog from 'pages/AuthenticationDialog.vue'

declare global {
    type AuthenticateOptions = {
        /** customized title text */
        title?: string,

        /** if set to true, the dialog will ask user to double-enter password as new password */
        resetMode?: boolean
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $state: ReturnType<typeof State.build>

        /** biometric password service */
        $bioPass: BioPass | null

        /**
         * pop up the authentication dialog to ask user entering password,
         * then run the given task and return the result
         * @param task a task which requires the password to finish
         * @param options
         */
        $authenticate<T>(
            task: (password: string) => Promise<T>,
            options?: AuthenticateOptions
        ): Promise<T>
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
            return (task, options) => {
                return new Promise((resolve, reject) => {
                    options = options || {}
                    vm.$q.dialog({
                        component: AuthenticationDialog,
                        parent: vm,
                        task,
                        title: options.title,
                        resetMode: options.resetMode
                    })
                        .onOk(resolve)
                        .onCancel(() => reject(new Error('cancelled')))
                })
            }
        }
    })
})
