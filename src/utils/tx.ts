import { Transaction } from 'thor-devkit/dist/transaction'
import { getParams } from 'components/queries'
import { randomBytes } from 'crypto'
import { cry } from 'thor-devkit'

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

export function buildTx(
    connex: Connex,
    clauses: Connex.Thor.Transaction['clauses'],
    gasPriceCoef: number,
    gas: number,
    dependsOn: string | null) {
    const genesis = connex.thor.genesis
    const bestId = connex.thor.status.head.id

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
                const originSig = cry.secp256k1.sign(cry.blake2b256(tx.encode()), privateKey)
                tx.signature = Buffer.concat([originSig, Buffer.from(delegatorSig.slice(2), 'hex')])
            } else {
                tx = new Transaction(txBody)
                tx.signature = cry.secp256k1.sign(cry.blake2b256(tx.encode()), privateKey)
            }
            return tx
        }
    }
}
