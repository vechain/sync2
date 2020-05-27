import { boot } from 'quasar/wrappers'
import * as State from 'src/state'
import { BioPass } from 'src/utils/bio-pass'
import AuthenticationDialog from 'pages/AuthenticationDialog.vue'
import { Storage } from 'core/storage'
import { QSpinnerIos } from 'quasar'

declare global {
    type AuthenticateOptions = {
        /** customized title text */
        title?: string
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $state: ReturnType<typeof State.build>

        /** biometric password service */
        $bioPass: BioPass | null

        $storage: Storage

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

        $loading<T>(task: () => Promise<T>): Promise<T>
    }
}

export default boot(async ({ Vue }) => {
    const state = State.build()
    const bioPass = await BioPass.init('main')
    const storage = await Storage.init()
    let loadingCount = 0

    Object.defineProperties(Vue.prototype, {
        $state: {
            get() { return state }
        },
        $bioPass: {
            get() { return bioPass }
        },
        $storage: {
            get() { return storage }
        },
        $authenticate: {
            get(): Vue['$authenticate'] {
                const vm = this as Vue
                return (task, options) => {
                    return new Promise((resolve, reject) => {
                        options = options || {}
                        vm.$q.dialog({
                            component: AuthenticationDialog,
                            parent: vm,
                            task,
                            title: options.title
                        })
                            .onOk(resolve)
                            .onCancel(() => reject(new Error('cancelled')))
                    })
                }
            }
        },
        $loading: {
            get(): Vue['$loading'] {
                const root = (this as Vue).$root
                return async (task) => {
                    try {
                        if (loadingCount++ === 0) {
                            root.$el.classList.add('loading-disable-all')
                            root.$q.loading.show({
                                spinner: QSpinnerIos as unknown as Vue,
                                delay: 200,
                                backgroundColor: 'transparent',
                                spinnerColor: 'black'
                            })
                        }
                        return await task()
                    } finally {
                        if (--loadingCount === 0) {
                            root.$q.loading.hide()
                            root.$el.classList.remove('loading-disable-all')
                        }
                    }
                }
            }
        }
    })
})
