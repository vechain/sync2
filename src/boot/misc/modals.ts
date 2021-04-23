import Vue from 'vue'
import AuthenticationDialog from 'pages/AuthenticationDialog'
import ModalLoading from 'components/ModalLoading.vue'
import QRCodeDialog from 'pages/QRCodeDialog.vue'
import { CertDialog, TxDialog } from 'pages/Sign'
import { QDialogOptions } from 'quasar'
import { BioPass } from 'src/utils/bio-pass'

declare module 'vue/types/vue' {
    interface Vue {
        $dialog<T>(options: QDialogOptions): Promise<T>

        /**
         * pop up the authentication dialog to ask user entering password
         * @returns user master key
         */
        $authenticate(): Promise<Buffer>

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

function dialog<T>(vm: Vue, options: QDialogOptions) {
    return new Promise<T>((resolve, reject) => {
        vm.$q.dialog({ ...options, parent: options.parent || vm /* set parent if missing */ })
            .onOk(resolve)
            .onCancel((err: unknown) => reject(err || new Error('cancelled')))
    })
}

export function boot() {
    Object.defineProperties(Vue.prototype, {
        $dialog: {
            get(): Vue['$dialog'] {
                const vm = this as Vue
                return (options) => {
                    return dialog(vm, options)
                }
            }
        },
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
                return async () => {
                    try {
                        const bioPass = await BioPass.open()
                        if (bioPass && await vm.$svc.config.getBioPassOn()) {
                            return Buffer.from(await bioPass.recall('Biometric Authentication'), 'hex')
                        }
                    } catch (err) {
                        if (err.code === -108 /* BIOMETRIC_DISMISSED */) {
                            throw err
                        }
                        console.warn(err)
                    }
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
                        component: TxDialog,
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
