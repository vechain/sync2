
import { abi } from 'thor-devkit'
import { abis } from 'src/consts'
import { TransferLogItem } from './models'

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

export async function vetTransfers(thor: Connex.Thor, token: M.TokenSpec, address: string, fromBlock: number, toBlock: number, offset: number, size: number): Promise<TransferLogItem[]> {
    const transferCriteria = [{ sender: address }, { recipient: address }]
    const filter = thor.filter('transfer', transferCriteria)
    const transfers = await filter.order('desc').range({
        unit: 'block',
        from: fromBlock,
        to: toBlock
    }).cache([address])
        .apply(offset, size)

    const result: TransferLogItem[] = []
    transfers.forEach(item => {
        const temp: M.TransferLog = {
            token: token,
            meta: item.meta,
            amount: item.amount,
            sender: item.sender,
            recipient: item.recipient
        }

        if (item.sender === address) {
            result.push({ ...temp, direction: '-' })
        }
        if (item.recipient === address) {
            result.push({ ...temp, direction: '+' })
        }
    })

    return result
}
export async function tokenTransfers(thor: Connex.Thor, tokenList: M.TokenSpec[], address: string, fromBlock: number, toBlock: number, offset: number, size: number): Promise<TransferLogItem[]> {
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
    const result: TransferLogItem[] = []

    event.forEach(item => {
        const decode = ev.decode(item.data, item.topics)
        const temp: M.TransferLog = {
            token: tokenMap[item.address],
            meta: item.meta,
            sender: decode._from,
            amount: decode._value,
            recipient: decode._to
        }

        if (decode._from === address) {
            result.push({ ...temp, direction: '-' })
        }
        if (decode._to === address) {
            result.push({ ...temp, direction: '+' })
        }
    })

    return result
}
