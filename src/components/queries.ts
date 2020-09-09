import { abis, tokenSpecs } from '../consts'
import { abi } from 'thor-devkit/dist/abi'
/**
 * fetch vip180 token balance for given address
 * @param connex the connex object
 * @param addr the address
 * @param spec token spec
 * @returns balance value
 */
export function tokenBalanceOf(connex: Connex, addr: string, spec: M.TokenSpec): Promise<string> {
    return connex
        .thor
        .account(spec.address)
        .method(abis.balanceOf)
        .cache([addr])
        .call(addr)
        .then(output => output.decoded!.balance)
}

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

export async function vetTransfers(connex: Connex, address: string, to: number, offset: number, size: number): Promise<M.TransferLog[]> {
    const transferCriteria = [{ sender: address }, { recipient: address }]
    const filter = connex.thor.filter('transfer').criteria(transferCriteria)
    const transfers = await filter.order('desc').range({
        unit: 'block',
        from: 0,
        to
    }).apply(offset, size)

    return transfers.map(item => {
        return {
            token: tokenSpecs.VET,
            meta: item.meta!,
            amount: item.amount,
            sender: item.sender,
            recipient: item.recipient
        }
    })
}

export async function tokenTransfers(connex: Connex, tokenList: M.TokenSpec[], address: string, to: number, offset: number, size: number): Promise<M.TransferLog[]> {
    const tokenMap: { [k: string]: M.TokenSpec } = {}
    tokenList.forEach(item => {
        tokenMap[item.address] = item
    })
    const tokenCriteria = createEventCriteria(connex, tokenList.map(item => item.address), address)
    const filter = connex.thor.filter('event').criteria(tokenCriteria)

    const event = await filter.order('desc').range({
        unit: 'block',
        from: 0,
        to
    }).apply(offset, size)

    const ev = new abi.Event(abis.transferEvent)
    return event.map(item => {
        const decode = ev.decode(item.data, item.topics)
        return {
            token: tokenMap[item.address],
            meta: item.meta!,
            sender: decode._from,
            amount: decode._value,
            recipient: decode._to
        }
    })
}
