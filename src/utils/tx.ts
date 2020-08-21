import { Transaction } from 'thor-devkit/dist/transaction'
import { getParams } from 'components/queries'

async function getBaseGasPrice(connex: Connex) {
    const baseGasPrice = '0x000000000000000000000000000000000000626173652d6761732d7072696365'
    return await getParams(connex, baseGasPrice)
}

export type EstimateGasResult = {
    gas: number,
    reverted: boolean
    revertReason: string
    vmError: string
    baseGasPrice: string
}

export async function estimateGas(
    connex: Connex,
    clauses: Connex.Thor.Clause[],
    suggestedGas: number | undefined,
    caller: string): Promise<EstimateGasResult> {
    const outputs = await connex.thor.explain()
        .caller(caller)
        .gas(suggestedGas || 2000 * 10000)
        .execute(clauses)

    if (!suggestedGas) {
        const execGas = outputs.reduce((sum, out) => sum + out.gasUsed, 0)
        const intrinsicGas = Transaction.intrinsicGas(clauses.map(item => {
            return {
                to: item.to,
                data: item.data || '0x',
                value: item.value || 0
            }
        }))
        suggestedGas = intrinsicGas + (execGas ? (execGas + 15000) : 0)
    }
    const bgp = await getBaseGasPrice(connex)
    const lastOutput = outputs.slice().pop()
    return {
        gas: suggestedGas,
        reverted: lastOutput ? lastOutput.reverted : false,
        revertReason: (lastOutput && lastOutput.decoded) ? (lastOutput.decoded.revertReason || '') : '',
        vmError: lastOutput ? lastOutput.vmError : '',
        baseGasPrice: bgp
    }
}
