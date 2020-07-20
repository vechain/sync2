import Vue from 'vue'
export function build() {
    const state = Vue.observable({
        balance: null as unknown as { [addr: string]: { [symbol: string]: string } },
        ready: true
    })

    return {
        get all() {
            return state.balance || {}
        },
        setBalance(addr: string, symbol: string, balance: string) {
            if (!state.balance) {
                state.balance = {}
            }
            if (!state.balance[addr]) {
                Vue.set(state.balance, addr, {})
            }
            Vue.set(state.balance[addr], symbol, balance)
        }
    }
}
