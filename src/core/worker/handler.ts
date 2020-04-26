/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')
import { HDNode } from 'thor-devkit/dist/cry/hdnode'
import { pbkdf2Sync } from 'crypto'

async function handleCommand(cmd: string, arg: any): Promise<any> {
    if (cmd === 'collectEntropy') {
        // generates 256-bit random key which is secured by extra CPU based entropy.
        return new Promise(resolve => {
            new m.Generator().generate(512, (entropy: number[]) => {
                resolve(Int16Array.from(entropy))
            })
        })
    } else if (cmd === 'deriveAddress') {
        const [pub, chainCode, index] = arg
        return HDNode
            .fromPublicKey(Buffer.from(pub), Buffer.from(chainCode))
            .derive(index)
            .address
    } else if (cmd === 'derivePrivateKey') {
        const [words, index] = arg
        return HDNode
            .fromMnemonic(words)
            .derive(index)
            .privateKey
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
