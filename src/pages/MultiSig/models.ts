import { BigNumber } from 'bignumber.js'

export type MultiSigTransactionLog = {
    from: string
    txIndex: BigNumber
    to: string
    value: BigNumber
    data: string
    meta: Connex.Thor.Filter.WithMeta['meta'],
}

export type MultiSigTransactionItem = {
    executed: boolean
    numConfirmations: BigNumber | number
    isConfirmed?: boolean
    fnName?: string
    parameters?: object
}
