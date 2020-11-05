import Vue from 'vue'

export function build() {
    const state = Vue.observable({
        updated: false
    })
    Object.defineProperty(window, 'AppState', {
        value: state
    })
    return state
}

type AppState = ReturnType<typeof build>

declare global {
    interface Window {
        readonly AppState: AppState
    }
}
