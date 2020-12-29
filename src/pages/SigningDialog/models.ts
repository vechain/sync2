export type TxOptions = {
    type: 'tx',
    req: M.TxRequest
}

export type CertOptions = {
    type: 'cert',
    req: M.CertRequest
}

export type SignerGroup = {
    name: string
    addresses: string[]
}
