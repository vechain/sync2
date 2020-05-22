// here define models
declare namespace M {
    interface Node {
        gid: string // the genesis id
        url: string
    }

    interface Wallet {
        id: number
        gid: string
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
