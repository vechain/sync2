/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')
import { HDNode } from 'thor-devkit/dist/cry/hdnode'
import { mnemonic } from 'thor-devkit/dist/cry/mnemonic'
import { pbkdf2Sync, createHmac, randomBytes } from 'crypto'

function collectEntropy() {
    return new Promise<Int16Array>(resolve => {
        new m.Generator().generate(512, (entropy: number[]) => {
            resolve(Int16Array.from(entropy))
        })
    })
}

async function handleCommand(cmd: string, arg: any): Promise<any> {
    if (cmd === 'collectEntropy') {
        return collectEntropy()
    } else if (cmd === 'hdGenerateMnemonic') {
        const [len] = arg
        const entropy = await collectEntropy()
        return mnemonic.generate(() => {
            const mac = createHmac('sha256', randomBytes(32))
            return mac.update(entropy).digest().slice(0, len)
        })
    } else if (cmd === 'hdDeriveMnemonic') {
        const [words, index] = arg
        const root = HDNode.fromMnemonic(words)
        const node = index < 0 ? root : root.derive(index)
        return [node.publicKey, node.chainCode, node.address, node.privateKey]
    } else if (cmd === 'hdDeriveXPub') {
        const [pub, chainCode, index] = arg
        const node = HDNode
            .fromPublicKey(Buffer.from(pub), Buffer.from(chainCode))
            .derive(index)
        return [node.publicKey, node.chainCode, node.address]
    } else if (cmd === 'kdf') {
        const [password, salt, n] = arg
        return pbkdf2Sync(password, Buffer.from(salt), n, 32, 'sha256')
    }
    throw new Error(`worker: unexpected command '${cmd}'`)
}

const ctx: Worker = self as never
ctx.onmessage = async (ev) => {
    const [cmd, arg] = ev.data
    try {
        const result = await handleCommand(cmd, arg)
        ctx.postMessage([result])
    } catch (err) {
        ctx.postMessage([undefined, err])
    }
}
