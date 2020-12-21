import { Transaction, secp256k1, blake2b256 } from 'thor-devkit'
import { abis } from 'src/consts'
import { randomBytes } from 'crypto'

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
    suggestedGas: number | undefined,
    caller: string): Promise<EstimateGasResult> {
    const outputs = await thor.explain(clauses)
        .caller(caller)
        .gas(suggestedGas || 2000 * 10000)
        .execute()

    if (!suggestedGas) {
        const execGas = outputs.reduce((sum, out) => sum + out.gasUsed, 0)
        const intrinsicGas: number = Transaction.intrinsicGas(clauses.map(item => {
            return {
                to: item.to,
                data: item.data || '0x',
                value: item.value || 0
            }
        }))
        suggestedGas = intrinsicGas + (execGas ? (execGas + 15000) : 0)
    }

    const bgp = await getBaseGasPrice(thor)
    const lastOutput = outputs.slice().pop()
    return {
        gas: suggestedGas,
        reverted: lastOutput ? lastOutput.reverted : false,
        revertReason: lastOutput ? (lastOutput.revertReason || '') : '',
        vmError: lastOutput ? lastOutput.vmError : '',
        baseGasPrice: bgp
    }
}

export function buildTx(
    thor: Connex.Thor,
    clauses: Connex.Thor.Transaction['clauses'],
    gasPriceCoef: number,
    gas: number,
    dependsOn: string | null) {
    const genesis = thor.genesis
    const bestId = thor.status.head.id

    const txBody: Transaction.Body = {
        chainTag: Number.parseInt(genesis.id.slice(genesis.id.length - 2), 16),
        blockRef: bestId.slice(0, 18),
        expiration: 18, // about 3 mins
        clauses,
        gasPriceCoef,
        gas,
        dependsOn,
        nonce: '0x' + randomBytes(8).toString('hex')
    }
    return {
        unsignedTx: (features?: boolean) => {
            let reserved = {}
            if (features) {
                reserved = {
                    reserved: {
                        features: 1
                    }
                }
            }
            return new Transaction({ ...txBody, ...reserved })
        },
        signTx: (privateKey: Buffer, delegatorSig?: string) => {
            let tx
            if (delegatorSig) {
                tx = new Transaction({ ...txBody, reserved: { features: 1 } })
                const originSig = secp256k1.sign(blake2b256(tx.encode()), privateKey)
                tx.signature = Buffer.concat([originSig, Buffer.from(delegatorSig.slice(2), 'hex')])
            } else {
                tx = new Transaction(txBody)
                tx.signature = secp256k1.sign(blake2b256(tx.encode()), privateKey)
            }
            return tx
        }
    }
}
