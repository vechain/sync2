import Vue from 'vue'
import AuthenticationDialog from 'pages/AuthenticationDialog'
import SigningDialog from 'src/pages/SigningDialog'
import ModalLoading from 'components/ModalLoading.vue'
import QRCodeDialog from 'pages/QRCodeDialog.vue'
import { CertDialog } from 'pages/Sign'

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

        /**
         * qr code dialog
         * @param req
         */
        $qrcode(req: M.QRRequest): void
    }
}

const loadingFunc = (() => {
    let counter = 0
    let vm: Vue
    return async <T>(task: () => Promise<T>) => {
        try {
            if (counter++ === 0) {
                // set 0 delay to block mouse/touch event
                const node = document.createElement('div')
                document.body.appendChild(node)
                vm = new ModalLoading({ el: node })
            }
            return await task()
        } finally {
            if (--counter === 0) {
                vm!.$destroy()
                vm!.$el.remove()
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
                return async (task) => {
                    return loadingFunc(task)
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
                        component: CertDialog,
                        gid,
                        req
                    })
                }
            }
        },
        $qrcode: {
            get(): Vue['$qrcode'] {
                const vm = this as Vue
                return (req) => {
                    return dialog(vm, {
                        component: QRCodeDialog,
                        req
                    })
                }
            }
        }
    })
}
