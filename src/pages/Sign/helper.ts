import { abi, Transaction } from 'thor-devkit'
import { abis } from 'src/consts'
import { BigNumber } from 'bignumber.js'

const paramsCache: Record<string, string> = {}

async function getBaseGasPrice(thor: Connex.Thor) {
    const baseGasPrice = '0x000000000000000000000000000000000000626173652d6761732d7072696365'
    const k = `${thor.genesis.id}-${baseGasPrice}`
    if (paramsCache[k]) {
        return paramsCache[k]
    } else {
        const address = '0x0000000000000000000000000000506172616d73'
        const result = await thor
            .account(address)
            .method(abis.paramsGet)
            .cache([address])
            .call(baseGasPrice)

        paramsCache[k] = result.data
        return result.data
    }
}

export type EstimateGasResult = {
    gas: number,
    reverted: boolean
    revertReason: string
    vmError: string
    baseGasPrice: string
}

export async function estimateGas(
    thor: Connex.Thor,
    clauses: Connex.VM.Clause[],
    suggestedGas: number,
    caller: string,
    gasPayer?: string
): Promise<EstimateGasResult> {
    const intrinsicGas = Transaction.intrinsicGas(clauses.map(item => {
        return {
            to: item.to,
            value: item.value || 0,
            data: item.data || '0x'
        }
    }))
    const offeredGas = suggestedGas ? Math.max(suggestedGas - intrinsicGas, 1) : 2000 * 10000
    const explainer = thor.explain(clauses)
        .caller(caller)
        .gas(offeredGas)

    if (gasPayer) {
        explainer.gasPayer(gasPayer)
    }

    const outputs = await explainer.execute()

    let gas = suggestedGas
    if (!gas) {
        const execGas = outputs.reduce((sum, out) => sum + out.gasUsed, 0)
        gas = intrinsicGas + (execGas ? (execGas + 15000) : 0)
    }

    const bgp = await getBaseGasPrice(thor)
    const lastOutput = outputs.slice().pop()
    return {
        gas,
        reverted: lastOutput ? lastOutput.reverted : false,
        revertReason: lastOutput ? (lastOutput.revertReason || '') : '',
        vmError: lastOutput ? lastOutput.vmError : '',
        baseGasPrice: bgp
    }
}

export function calcFee(gas: number, baseGasPrice: string, gasPriceCoef: number) {
    return new BigNumber(baseGasPrice)
        .times(gasPriceCoef)
        .idiv(255)
        .plus(baseGasPrice)
        .times(gas)
}

const TRANSFER_SIG = new abi.Function(abis.transfer).signature

export function decodeAsTokenTransferClause(clause: Connex.VM.Clause, spec: M.TokenSpec): { to: string, amount: string } | null {
    let { data, to } = clause
    data = data || ''
    to = to && to.toLowerCase()

    if (to === spec.address && data.startsWith(TRANSFER_SIG)) {
        try {
            const decoded = abi.decodeParameters(abis.transfer.inputs, '0x' + data.slice(TRANSFER_SIG.length))
            return {
                to: decoded._to,
                amount: decoded._value
            }
        } catch { }
    }
    return null
}
