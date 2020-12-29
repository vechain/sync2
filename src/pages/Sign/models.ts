import * as V from 'validator-ts'

type TxPayload = {
    message: Connex.Vendor.TxMessage
    options: Connex.Driver.TxOptions
}

type CertPayload = {
    message: Connex.Vendor.CertMessage
    options: Connex.Driver.CertOptions
}

/** request relayed by TOS */
export type RelayedRequest = {
    gid: string // genesis id which to specify network
    origin?: string
} & ({
    type: 'tx'
    payload: TxPayload
} | {
    type: 'cert'
    payload: CertPayload
})

export namespace RelayedRequest {
    const scheme: V.Scheme<RelayedRequest> = {
        gid: v => /^0x[0-9a-f]{64}$/.test(v) ? '' : `invalid gid '${v}'`,
        origin: () => '',
        type: (v: unknown) => (v === 'tx' || v === 'cert') ? '' : `unsupported type '${v}'`,
        payload: () => ''
    }
    // TODO strict scheme
    const txPayloadScheme: V.Scheme<TxPayload> = {
        message: v => v instanceof Object ? '' : 'message requires object type',
        options: v => v instanceof Object ? '' : 'options requires object type'
    }
    const certPayloadScheme: V.Scheme<CertPayload> = {
        message: v => v instanceof Object ? '' : 'message requires object type',
        options: v => v instanceof Object ? '' : 'options requires object type'
    }

    export function validate(obj: RelayedRequest) {
        const ret = V.validate(obj, scheme)
        if (ret.type === 'tx') {
            ret.payload = V.validate(ret.payload, txPayloadScheme)
        } else {
            ret.payload = V.validate(ret.payload, certPayloadScheme)
        }
        return ret
    }
}

/** response relayed by TOS */
export type RelayedResponse = {
    error?: string
    payload?: object
}
