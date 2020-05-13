import _Vue from 'vue'
import { Storage } from 'core/storage'

function build(Vue: typeof _Vue) {
    const state = Vue.observable({
        wallets: [] as Storage.WalletEntity[]
    })

    return {
        state,
        mutations: {}
    }
}

export default function install(Vue: typeof _Vue) {
    const { state, mutations } = build(Vue)

    Object.defineProperty(Vue.prototype, '$state', {
        get() { return state }
    })
    Object.defineProperty(Vue.prototype, '$stateMutations', {
        get() { return mutations }
    })
}

declare module 'vue/types/vue' {
    interface Vue {
        readonly $state: ReturnType<typeof build>['state']
        readonly $stateMutations: ReturnType<typeof build>['mutations']
    }
}
