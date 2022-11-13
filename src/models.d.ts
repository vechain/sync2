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
            type: 'hd' | 'ledger' | 'multisig'
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
        options: Connex.Driver.TxOptions
        origin?: string
    }

    type TxResponse = Connex.Vendor.TxResponse

    interface CertRequest {
        message: Connex.Vendor.CertMessage,
        options: Connex.Driver.CertOptions
        domain: string,
        origin?: string,
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
            origin: string // the dapp url which issues the request
            link: string // the url linking to dapp to reveal tx/cert if provided
        }
        type TxGlob = Glob & {
            comment: string
            receipt: Connex.Thor.Transaction.Receipt | null
        }
        type CertGlob = Glob
    }

    type QRRequest = {
        title?: string
        content: string
        message?: string
        messageClass?: string
    }
}
