import { boot } from 'quasar/wrappers'
import * as State from './state'
import * as Plugins from './plugins'

import AuthenticationDialog from 'pages/AuthenticationDialog.vue'
import { QSpinnerIos, DialogChainObject, QDialogOptions } from 'quasar'
import ActionSheets from 'pages/ActionSheets.vue'
import TxSigningDialog from 'pages/TxSigningDialog.vue'
import CertSigningDialog from 'pages/CertSigningDialog.vue'

declare module 'vue/types/vue' {
    interface Vue {
        /**
         * pop up the authentication dialog to ask user entering password,
         * then run the given task and return the result
         * @param task a task which requires the password to finish
         * @param options
         */
        $authenticate<T>(
            task: (password: string) => Promise<T>,
            args?: AuthenticationDialog.Args
        ): Promise<T>

        /**
         * protected the async task with a loading mask
         * @param task the async task
         * @returns the result of the task
         */
        $loading<T>(task: () => Promise<T>): Promise<T>

        /** display an action sheets */
        $actionSheets(actions: Array<{ label: string, classes?: string | string[], onClick?: Function }>): Promise<boolean>

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

        /** it wraps window.addEventListener binding to vue component's life-cycle */
        $onWindowEvent(event: keyof WindowEventMap, listener: EventListenerOrEventListenerObject): void
    }
}

const replaceDialog = (() => {
    let prev: DialogChainObject | undefined
    return <T>(vm: Vue, options: QDialogOptions) => {
        return new Promise<T>((resolve, reject) => {
            // close the previous dialog if one opened
            if (prev) {
                prev.hide()
                prev = undefined
            }
            const cur = vm.$q.dialog(options)
            cur.onOk(resolve)
                .onCancel((e: Error) => reject(e || new Error('cancelled')))
                .onDismiss(() => {
                    if (prev === cur) {
                        prev = undefined
                    }
                })

            prev = cur
        })
    }
})()

export default boot(({ Vue }) => {
    State.boot()
    Plugins.boot()

    let loadingCount = 0

    const delayedSpinner = Vue.component('DelayedSpinner', {
        data: () => { return { display: false } },
        props: { color: String, size: Number },
        created() { setTimeout(() => { this.display = true }, 200) },
        render(h) {
            if (!this.display) {
                return h()
            }
            const spinner = h(QSpinnerIos, { props: this.$props })
            return h('transition', {
                props: {
                    name: 'q-transition--fade',
                    appear: true
                }
            }, [spinner])
        }
    })

    Object.defineProperties(Vue.prototype, {
        $authenticate: {
            get(): Vue['$authenticate'] {
                const vm = this as Vue
                return (task, args) => {
                    return new Promise((resolve, reject) => {
                        vm.$q.dialog({
                            component: AuthenticationDialog,
                            parent: vm,
                            task,
                            args: args || {}
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
                            // set 0 delay to block mouse/touch event
                            root.$q.loading.show({
                                spinner: delayedSpinner as unknown as Vue,
                                delay: 0,
                                backgroundColor: 'transparent',
                                spinnerColor: 'black'
                            })
                        }
                        return await task()
                    } finally {
                        if (--loadingCount === 0) {
                            root.$q.loading.hide()
                        }
                    }
                }
            }
        },
        $actionSheets: {
            get(): Vue['$actionSheets'] {
                const vm = this as Vue
                return actions => {
                    return new Promise((resolve) => {
                        vm.$q.dialog({
                            component: ActionSheets,
                            parent: vm,
                            actions
                        }).onCancel(() => {
                            resolve(false)
                        }).onDismiss(() => {
                            resolve(false)
                        }).onOk(() => {
                            resolve(true)
                        })
                    })
                }
            }
        },
        $signTx: {
            get(): Vue['$signTx'] {
                const vm = this as Vue
                return (gid, req) => {
                    return replaceDialog(vm, {
                        component: TxSigningDialog,
                        parent: vm,
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
                    return replaceDialog(vm, {
                        component: CertSigningDialog,
                        parent: vm,
                        gid,
                        req
                    })
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
