
import { abi } from 'thor-devkit'
import { abis } from 'src/consts'
function createEventCriteria(thor: Connex.Thor, tokens: string[], address: string): Connex.Thor.Filter.Criteria<'event'>[] {
    const from = tokens.map(item => {
        return thor.account(item).event(abis.transferEvent).asCriteria({
            _from: address
        })
    })
    const to = tokens.map(item => {
        return thor.account(item).event(abis.transferEvent).asCriteria({
            _to: address
        })
    })
    return [...from, ...to]
}

export async function vetTransfers(thor: Connex.Thor, token: M.TokenSpec, address: string, fromBlock: number, toBlock: number, offset: number, size: number): Promise<M.TransferLog[]> {
    const transferCriteria = [{ sender: address }, { recipient: address }]
    const filter = thor.filter('transfer', transferCriteria)
    const transfers = await filter.order('desc').range({
        unit: 'block',
        from: fromBlock,
        to: toBlock
    }).cache([address])
        .apply(offset, size)
    return transfers.map(item => {
        return {
            token: token,
            meta: item.meta,
            amount: item.amount,
            sender: item.sender,
            recipient: item.recipient
        }
    })
}
export async function tokenTransfers(thor: Connex.Thor, tokenList: M.TokenSpec[], address: string, fromBlock: number, toBlock: number, offset: number, size: number): Promise<M.TransferLog[]> {
    const tokenMap: { [k: string]: M.TokenSpec } = {}
    tokenList.forEach(item => {
        tokenMap[item.address] = item
    })
    const tokenCriteria = createEventCriteria(thor, tokenList.map(item => item.address), address)
    const filter = thor.filter('event', tokenCriteria)

    const event = await filter.order('desc').range({
        unit: 'block',
        from: fromBlock,
        to: toBlock
    }).cache([address])
        .apply(offset, size)

    const ev = new abi.Event(abis.transferEvent)
    return event.map(item => {
        const decode = ev.decode(item.data, item.topics)
        return {
            token: tokenMap[item.address],
            meta: item.meta,
            sender: decode._from,
            amount: decode._value,
            recipient: decode._to
        }
    })
}
