// codes in this file run in web worker

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')
import { HDNode } from 'thor-devkit/dist/cry/hdnode'
import { mnemonic } from 'thor-devkit/dist/cry/mnemonic'
import {
    pbkdf2Sync,
    createHmac,
    randomBytes,
    createCipheriv,
    createDecipheriv,
    createHash
} from 'crypto'

/** collect CPU based extra entropy */
function collectEntropy() {
    return new Promise<Int16Array>(resolve => {
        new m.Generator().generate(512, (entropy: number[]) => {
            resolve(Int16Array.from(entropy))
        })
    })
}

function kdf(password: string, salt: Buffer, n: number) {
    return pbkdf2Sync(password, Buffer.from(salt), n, 32, 'sha256')
}

type CipherGlob = {
    cipherText: string
    iv: string
    kdf: {
        n: number
    },
    mac: string
}

function encrypt(clearText: Buffer, password: string, salt: Buffer) {
    const iterations = 1000
    const key = kdf(password, salt, iterations)
    const encryptKey = key.slice(0, 16)
    const macPrefix = key.slice(16)
    const iv = randomBytes(16)

    const enc = createCipheriv('aes-128-cbc', encryptKey, iv)
    const cipherText = Buffer.concat([enc.update(clearText), enc.final()])
    const mac = createHash('sha256')
        .update(macPrefix)
        .update(cipherText)
        .digest()
        .toString('hex')

    const glob: CipherGlob = {
        cipherText: cipherText.toString('hex'),
        iv: iv.toString('hex'),
        kdf: {
            n: iterations
        },
        mac
    }
    return JSON.stringify(glob)
}

function decrypt(jsonGlob: string, password: string, salt: Buffer) {
    const glob = JSON.parse(jsonGlob)
    const key = kdf(password, salt, glob.kdf.n)
    const encryptKey = key.slice(0, 16)
    const macPrefix = key.slice(16)

    const cipherText = Buffer.from(glob.cipherText, 'hex')

    const mac = createHash('sha256')
        .update(macPrefix)
        .update(cipherText)
        .digest().toString('hex')

    if (mac !== glob.mac) {
        throw new Error('wrong password')
    }
    const dec = createDecipheriv('aes-128-cbc', encryptKey, Buffer.from(glob.iv, 'hex'))
    return Buffer.concat([dec.update(cipherText), dec.final()])
}

async function handleCommand(cmd: string, arg: any): Promise<any> {
    if (cmd === 'generateSalt') {
        const entropy = await collectEntropy()
        const mac = createHmac('sha256', randomBytes(32))
        return mac.update(entropy).digest()
    } else if (cmd === 'encrypt') {
        const [clearText, password, salt] = arg
        return encrypt(Buffer.from(clearText), password, Buffer.from(salt))
    } else if (cmd === 'decrypt') {
        const [jsonGlob, password, salt] = arg
        return decrypt(jsonGlob, password, Buffer.from(salt))
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
        // TODO error translation
        ctx.postMessage([undefined, err])
    }
}
