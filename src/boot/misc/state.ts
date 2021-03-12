import Vue from 'vue'

type State = {
    app: {
        updateAvailable: boolean
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $state: State
    }
}

declare global {
    interface Window {
        readonly AppState: State['app']
    }
}

export function boot() {
    const state = Vue.observable<State>({
        app: {
            updateAvailable: false
        }
    })

    Object.defineProperty(Vue.prototype, '$state', {
        get() { return state }
    })

    Object.defineProperty(window, 'AppState', {
        get() { return state.app }
    })

    // to watch available update for electron build only
    if (process.env.MODE === 'electron') {
        require('@electron/remote').app.updater.newVersion.then(() => {
            state.app.updateAvailable = true
        })
    }
}
