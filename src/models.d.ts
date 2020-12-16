// here define models
declare namespace M {
    interface Node {
        genesis: Connex.Thor.Block
        url: string
        preset?: boolean
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
        gid: string
        name: string
        symbol: string
        decimals: number
        address: string
        iconSrc: string
        permanent: boolean
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

    type Activity<T extends 'id?' | 'id!' = 'id!'> =
        (T extends 'id!' ? { id: number } : { id?: number }) & {
            gid: string
            walletId: number
            createdTime: number
            status: '' | 'completed'
        } & ({
            type: 'tx'
            glob: Activity.TxGlob
        } | {
            type: 'cert'
            glob: Activity.CertGlob
        })
    namespace Activity {
        type Glob = {
            id: string // the tx/cert id
            encoded: string // encoded tx/cert
            signer: string // the address signed the tx/cert
            origin?: string // the dapp url if any
            link?: string // the url linking to dapp to reveal tx/cert if provided
        }
        type TxGlob = Glob & {
            comment: string
            receipt: Connex.Thor.Transaction.Receipt | null
        }
        type CertGlob = Glob
    }
}
