import type Transport from 'ledgerhq__hw-transport'

const connector: { connect(): Promise<Transport> } | null = (() => {
    if (process.env.MODE === 'electron') {
        return {
            connect: () => require('@ledgerhq/hw-transport-node-hid-noevents').default.open('')
        }
    } else if (process.env.MODE === 'spa' || process.env.MODE === 'pwa') {
        if ('hid' in window.navigator) {
            return {
                connect: () => require('@ledgerhq/hw-transport-webhid').default.create()
            }
        }
    }
    return null
})()

export const supported = !!connector

// eslint-disable-next-line quotes
export const path = `44'/818'/0'/0`

export function connect() {
    if (!connector) {
        throw new Error('unsupported')
    }
    return connector.connect()
}
