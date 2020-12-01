// here define models
declare namespace M {
    interface Node {
        genesis: Connex.Thor.Block
        url: string
        active: boolean
        preset: boolean
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
        message: Connex.Vendor.CertMessage,
        domain: string,
        options?: {
            signer?: string
            link?: string
        }
    }

    type CertResponse = Connex.Vendor.CertResponse

    type TransferLog = {
        meta: Connex.Thor.Filter.WithMeta['meta'],
        token: TokenSpec,
        amount: string,
        sender: string,
        recipient: string
    }
    type Referer = {
        url?: string
        title?: string
    }
    interface Activity<T extends 'tx' | 'cert'> {
        id: number
        gid: string
        walletId: number
        createdTime: number
        status: '' | 'completed'
        glob: T extends 'tx' ? Activity.Tx :
        T extends 'cert' ? Activity.Cert : never
    }
    namespace Activity {
        type Tx = {
            id: string
            type: 'tx'
            message: Connex.Vendor.TxMessage
            comment: string
            timestamp: number
            signer: string
            estimatedFee: string
            referer: Referer
            raw: string
            receipt: Connex.Thor.Transaction.Receipt | null
        }
        type Cert = {
            id: string
            type: 'cert'
            message: Connex.Vendor.CertMessage
            signer: string
            referer: Referer
            timestamp: number
            signature: string
        }
    }
}
