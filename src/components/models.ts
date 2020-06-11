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
        interface Card {
            address: string
            hidden?: boolean
        }

        interface Meta {
            name: string
            cards: Card[]
            backedUp?: boolean
        }
    }

    interface Token {
        name: string
        symbol: string
        decimals: number
        address: string
        desc: string
        icon: string
        totalSupply: string
    }
}
