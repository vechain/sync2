
import { abi } from 'thor-devkit'
import { SubmitTransactionEvent } from '../const'
import { MultiSigTransactionLog } from '../models'

export async function submitTransactions(thor: Connex.Thor, address: string, fromBlock: number, toBlock: number, offset: number, size: number): Promise<MultiSigTransactionLog[]> {
    const criteria = [thor.account(address).event(SubmitTransactionEvent).asCriteria({})]
    const filter = thor.filter('event', criteria)

    const event = await filter.order('desc').range({
        unit: 'block',
        from: fromBlock,
        to: toBlock
    }).apply(offset, size)

    const ev = new abi.Event(SubmitTransactionEvent)
    const result: MultiSigTransactionLog[] = []

    event.forEach(item => {
        const decode = ev.decode(item.data, item.topics)
        result.push({
            txIndex: decode.txIndex,
            from: decode.owner,
            to: decode.to,
            value: decode.value,
            data: decode.data,
            meta: item.meta
        })
    })

    return result
}
