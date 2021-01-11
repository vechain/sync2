// codes in this file run in web worker

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')
import { HDNode, blake2b256, mnemonic } from 'thor-devkit'
import {
    pbkdf2Sync,
    createHmac,
    randomBytes,
    createCipheriv,
    createDecipheriv,
    createHash
} from 'crypto'
import type { CommandName, KdfCipherGlob, CipherGlob } from './index'

/**
 * securely generate random bytes
 * @param size in bytes (at most 32)
 */
async function secureRNG(size: number) {
    if (size > 32) {
        throw new Error('secureRGN size should be <= 32')
    }
    // collect CPU based extra entropy
    const entropy = await new Promise<Int16Array>(resolve => {
        new m.Generator().generate(512, (entropy: number[]) => {
            resolve(Int16Array.from(entropy))
        })
    })
    const mac = createHmac('sha256', randomBytes(32))
    return mac.update(entropy).digest().slice(0, size)
}

function encrypt(clearText: Buffer, key: Buffer): CipherGlob {
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

    return {
        cipherText: cipherText.toString('hex'),
        iv: iv.toString('hex'),
        mac: mac
    }
}

function decrypt(glob: CipherGlob, key: Buffer) {
    const encryptKey = key.slice(0, 16)
    const macPrefix = key.slice(16)

    const cipherText = Buffer.from(glob.cipherText, 'hex')

    const mac = createHash('sha256')
        .update(macPrefix)
        .update(cipherText)
        .digest().toString('hex')

    if (mac !== glob.mac) {
        throw new Error('decrypt failed (MAC mismatch)')
    }
    const dec = createDecipheriv('aes-128-cbc', encryptKey, Buffer.from(glob.iv, 'hex'))
    return Buffer.concat([dec.update(cipherText), dec.final()])
}

const kdfCache: Record<string, Buffer> = {}

function kdf(password: string, salt: Buffer, n: number) {
    const cacheKey = `${blake2b256(salt, password).toString('hex')}-${n}`
    let cached = kdfCache[cacheKey]
    if (!cached) {
        cached = kdfCache[cacheKey] = pbkdf2Sync(password, salt, n, 32, 'sha256')
    }
    return cached
}

function kdfEncrypt(clearText: Buffer, password: string, salt: Buffer): KdfCipherGlob {
    const iterations = 5000
    const key = kdf(password, salt, iterations)
    const glob = encrypt(clearText, key)
    return {
        ...glob,
        kdf: {
            salt: salt.toString('hex'),
            n: iterations
        }
    }
}

function kdfDecrypt(glob: KdfCipherGlob, password: string): Buffer {
    const { salt, n } = glob.kdf
    const key = kdf(password, Buffer.from(salt, 'hex'), n)
    return decrypt(glob, key)
}

async function handleCommand(cmd: CommandName, arg: any) {
    switch (cmd) {
        case 'secureRNG': {
            const [size] = arg
            return secureRNG(size)
        }
        case 'kdfEncrypt': {
            const [clearText, password] = arg
            return kdfEncrypt(Buffer.from(clearText), password, randomBytes(32))
        }
        case 'kdfDecrypt': {
            const [glob, password] = arg
            return kdfDecrypt(glob, password)
        }
        case 'encrypt': {
            const [clearText, key] = arg
            return encrypt(Buffer.from(clearText), Buffer.from(key))
        }
        case 'decrypt': {
            const [glob, key] = arg
            return decrypt(glob, Buffer.from(key))
        }
        case 'hdGenerateMnemonic': {
            const [len] = arg
            const rn = await secureRNG(len)
            return mnemonic.generate(() => rn)
        }
        case 'hdDeriveMnemonic': {
            const [words, index] = arg
            const root = HDNode.fromMnemonic(words)
            const node = index < 0 ? root : root.derive(index)
            return [node.publicKey, node.chainCode, node.address, node.privateKey]
        }
        case 'hdDeriveXPub': {
            const [pub, chainCode, index] = arg
            const node = HDNode
                .fromPublicKey(Buffer.from(pub), Buffer.from(chainCode))
                .derive(index)
            return [node.publicKey, node.chainCode, node.address]
        }
        default:
            throw new Error(`worker: unexpected command '${cmd}'`)
    }
}

const ctx: Worker = self as never
ctx.onmessage = async (ev) => {
    const [seq, cmd, arg] = ev.data
    try {
        const result = await handleCommand(cmd, arg)
        ctx.postMessage([seq, result])
    } catch (err) {
        // TODO error translation
        ctx.postMessage([seq, undefined, { message: err.message }])
    }
}
