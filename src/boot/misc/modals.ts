import Vue from 'vue'
import AuthenticationDialog from 'pages/AuthenticationDialog'
import SigningDialog from 'src/pages/SigningDialog'
import { QSpinnerIos } from 'quasar'

declare module 'vue/types/vue' {
    interface Vue {
        /**
         * pop up the authentication dialog to ask user entering password
         * @returns verified user password
         */
        $authenticate(): Promise<string>

        /**
         * protected the async task with a loading mask
         * @param task the async task
         * @returns the result of the task
         */
        $loading<T>(task: () => Promise<T>): Promise<T>

        /**
         * sign tx
         * @param gid desired genesis id of user wallet
         * @param req request content
         */
        $signTx(
            gid: string,
            req: M.TxRequest
        ): Promise<M.TxResponse>

        /**
         * sign cert
         * @param gid desired genesis id of user wallet
         * @param req request content
         */
        $signCert(
            gid: string,
            req: M.CertRequest
        ): Promise<M.CertResponse>
    }
}

const loadingFunc = (() => {
    let counter = 0
    return async <T>(vm: Vue, task: () => Promise<T>) => {
        let delayTimer
        try {
            if (counter++ === 0) {
                // set 0 delay to block mouse/touch event
                vm.$q.loading.show({
                    spinner: undefined,
                    delay: 0,
                    backgroundColor: 'transparent'
                })
                delayTimer = setTimeout(() => {
                    vm.$q.loading.show({
                        spinner: QSpinnerIos as unknown as Vue,
                        delay: 0,
                        backgroundColor: 'transparent',
                        spinnerColor: 'black'
                    })
                }, 200)
            }
            return await task()
        } finally {
            if (--counter === 0) {
                if (delayTimer) {
                    clearTimeout(delayTimer)
                }
                vm.$q.loading.hide()
            }
        }
    }
})()

function dialog<T>(vm: Vue, options: object) {
    return new Promise<T>((resolve, reject) => {
        vm.$q.dialog({ ...options, parent: vm /* always set parent */ })
            .onOk(resolve)
            .onCancel((e: Error) => reject(e || new Error('cancelled')))
    })
}

export function boot() {
    Object.defineProperties(Vue.prototype, {
        $loading: {
            get(): Vue['$loading'] {
                const root = (this as Vue).$root
                return async (task) => {
                    return loadingFunc(root, task)
                }
            }
        },
        $authenticate: {
            get(): Vue['$authenticate'] {
                const vm = this as Vue
                return () => {
                    return dialog(vm, {
                        component: AuthenticationDialog
                    })
                }
            }
        },
        $signTx: {
            get(): Vue['$signTx'] {
                const vm = this as Vue
                return (gid, req) => {
                    return dialog(vm, {
                        component: SigningDialog,
                        type: 'tx',
                        gid,
                        req
                    })
                }
            }
        },
        $signCert: {
            get(): Vue['$signCert'] {
                const vm = this as Vue
                return (gid, req) => {
                    return dialog(vm, {
                        component: SigningDialog,
                        type: 'cert',
                        gid,
                        req
                    })
                }
            }
        }
    })
}
