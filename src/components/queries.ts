import { abis } from '../consts'

const paramsCache: Record<string, string> = {}

export async function getParams(connex: Connex, key: string): Promise<string> {
    const k = `${connex.thor.genesis.id}-${key}`
    if (paramsCache[k]) {
        return paramsCache[k]
    } else {
        const address = '0x0000000000000000000000000000506172616d73'
        const result = await connex.thor
            .account(address)
            .method(abis.paramsGet)
            .cache([address])
            .call(key)

        paramsCache[k] = result.data
        return result.data
    }
}

export function createEventCriteria(connex: Connex, tokens: string[], address: string): Connex.Thor.Filter.Criteria<'event'>[] {
    const from = tokens.map(item => {
        return connex.thor.account(item).event(abis.transferEvent).asCriteria({
            _from: address
        })
    })
    const to = tokens.map(item => {
        return connex.thor.account(item).event(abis.transferEvent).asCriteria({
            _to: address
        })
    })
    return [...from, ...to]
}

export async function txReceipt(connex: Connex, txid: string) {
    const tx = connex.thor.transaction(txid)
    return tx.getReceipt()
}
