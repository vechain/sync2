import * as V from 'validator-ts'

/** request relayed by TOS */
export type RelayedRequest = {
    type: 'tx' | 'cert'
    gid: string // genesis id which to specify network
    payload: {
        message: object
        options: object
    }
    origin?: string
}

export namespace RelayedRequest {
    const scheme: V.Scheme<RelayedRequest> = {
        type: v => (v === 'tx' || v === 'cert') ? '' : `unsupported type '${v}'`,
        gid: v => /^0x[0-9a-f]{64}$/i.test(v) ? '' : `invalid gid '${v}'`,
        payload: {
            message: v => v instanceof Object ? '' : 'message requires object type',
            options: v => v instanceof Object ? '' : 'options requires object type'
        },
        origin: () => ''
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
