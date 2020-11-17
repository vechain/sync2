import * as V from 'validator-ts'

/** request relayed by TOS */
export type RelayedRequest = {
    type: 'tx' | 'cert'
    gid?: string // genesis id which to specify network. defaults to mainnet
    payload: {
        message: object
        options: object
    }
    /* nonce: string */
}

export namespace RelayedRequest {
    const scheme: V.Scheme<RelayedRequest> = {
        type: v => (v === 'tx' || v === 'cert') ? '' : `unsupported type '${v}'`,
        gid: v => (!v || /^0x[0-9a-f]{64}$/i.test(v)) ? '' : `invalid gid '${v}'`,
        payload: {
            message: v => v instanceof Object ? '' : 'message requires object type',
            options: v => v instanceof Object ? '' : 'options requires object type'
        }
    }
    export function validate(obj: RelayedRequest) {
        return V.validate(obj, scheme)
    }
}

/** response relayed by TOS */
export type RelayedResponse = {
    error?: string
    payload?: object
}
