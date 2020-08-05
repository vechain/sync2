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
            addresses: string[]
            backedUp?: boolean
        }
    }

    interface TokenSpec {
        name: string
        symbol: string
        decimals: number
        address: string
        desc: string
        icon: string
        totalSupply: string
    }

    interface TxRequest {
        message: Connex.Vendor.TxMessage
        options?: {
            signer?: string
            gas?: number
            dependsOn?: string
            link?: string
            comment?: string
            delegate?: string
        }
    }

    type TxResponse = Connex.Vendor.TxResponse

    interface CertRequest {
        message: Connex.Vendor.CertMessage
        options?: {
            signer?: string
            link?: string
        }
    }

    type CertResponse = Connex.Vendor.CertResponse
}
