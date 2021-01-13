// codes in this file run in web worker

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')
import { HDNode, blake2b256, mnemonic } from 'thor-devkit'
import {
    randomBytes,
    createCipheriv,
    createDecipheriv,
    createHash
} from 'crypto'
import type { CommandName, KdfCipherGlob, CipherGlob } from './index'
import { Pbkdf2HmacSha256 } from 'asmcrypto.js'

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
    const mac = createHash('sha256')
    return mac.update(randomBytes(32)).update(entropy).digest().slice(0, size)
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

function kdfEstimateIterations() {
    let iterations = 100000
    const pass = Buffer.from('password', 'utf8')
    const salt = randomBytes(32)

    for (; ;) {
        const startTime = Date.now()
        Pbkdf2HmacSha256(pass, salt, iterations, 32)
        const elapse = Date.now() - startTime
        if (elapse < 400) {
            iterations *= 2
        } else if (elapse < 1000) {
            return iterations * 2
        } else {
            return iterations
        }
    }
}

function kdf(password: string, salt: Buffer, n: number) {
    const cacheKey = `${blake2b256(salt, password).toString('hex')}-${n}`
    const key = kdfCache[cacheKey] || Buffer.from(Pbkdf2HmacSha256(Buffer.from(password, 'utf8'), salt, n, 32))
    return {
        key: key,
        cache: () => {
            kdfCache[cacheKey] = key
        }
    }
}

function kdfEncrypt(clearText: Buffer, password: string): KdfCipherGlob {
    const iterations = kdfEstimateIterations()
    const salt = randomBytes(32)
    const { key, cache } = kdf(password, salt, iterations)
    cache()
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
    const { key, cache } = kdf(password, Buffer.from(salt, 'hex'), n)
    try {
        const clearText = decrypt(glob, key)
        cache()
        return clearText
    } finally {
    }
}

async function handleCommand(cmd: CommandName, arg: any) {
    switch (cmd) {
        case 'secureRNG': {
            const [size] = arg
            return secureRNG(size)
        }
        case 'kdfEncrypt': {
            const [clearText, password] = arg
            return kdfEncrypt(Buffer.from(clearText), password)
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
