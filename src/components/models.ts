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

    interface TxResponse {
        result?: Connex.Vendor.TxResponse
        error?: Connex.ErrorType
    }

    interface CertRequest {
        message: Connex.Vendor.CertMessage
        options?: {
            signer?: string
            link?: string
        }
    }

    interface CertResponse {
        result?: Connex.Vendor.CertResponse
        error?: Connex.ErrorType
    }
}
