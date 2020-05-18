// here define models
declare namespace M {
    interface Network {
        id: string
        nodeUrl: string
        name: string
    }

    interface Wallet {
        id: number
        network: string
        vault: string
        meta: Wallet.Meta
    }

    namespace Wallet {
        interface Meta {
            name: string
            addresses: {
                index: number
                address: string // cached address
            }[]
        }
    }
}
