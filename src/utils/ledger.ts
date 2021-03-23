import type Transport from 'ledgerhq__hw-transport'

export const supported = (() => {
    switch (process.env.MODE) {
        case 'electron':
            return true
        case 'spa':
        case 'pwa':
            return 'hid' in window.navigator
        default: return false
    }
})()

export function connect(): Promise<Transport> {
    if (process.env.MODE === 'electron') {
        return require('@ledgerhq/hw-transport-node-hid-noevents').default.open('')
    } else if (process.env.MODE === 'spa' || process.env.MODE === 'pwa') {
        return require('@ledgerhq/hw-transport-webhid').default.create()
    }
    return Promise.reject(new Error('unsupported'))
}
