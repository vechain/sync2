// ---- worker methods ----
import Worker from 'worker-loader!./worker'
import { Deferred } from 'src/utils/deferred'
import type { CommandName } from './worker'
import { blake2b256 } from 'thor-devkit'

const worker = new Worker()

const queue = new Map<number, Deferred<unknown>>()

worker.onmessage = ev => {
    const [seq, result, err] = ev.data
    const r = queue.get(seq)!
    queue.delete(seq)

    if (err) {
        r.reject(new Error(err.message))
    } else {
        r.resolve(result)
    }
}

let nextSeq = 0

/**
 * convenient method for calling functions in web worker
 * @param cmd the command name
 * @param args command arguments
 */
function call<R>(cmd: CommandName, ...args: unknown[]): Promise<R> {
    const seq = ++nextSeq
    // args are passed in tuple
    worker.postMessage([seq, cmd, args])
    const r = new Deferred<unknown>()
    queue.set(seq, r)
    return r as Promise<R>
}

/**
 * securely generate random bytes
 * @param size in bytes (at most 32)
 */
export function secureRNG(size: number): Promise<Buffer> {
    return call<Uint8Array>('secureRNG', size)
        .then(r => Buffer.from(r))
}

/** to estimate suitable iterations */
function kdfEstimateN(): Promise<number> {
    return call('kdfEstimateN')
}

/**
 * kdf
 * @param password user password
 * @param salt random salt
 * @param n iterations
 */
function kdf(password: string, salt: Buffer, n: number): Promise<Buffer> {
    return call<Uint8Array>('kdf', Buffer.from(password, 'utf8'), salt, n)
        .then(r => Buffer.from(r))
}
// ---- worker methods ----

import {
    randomBytes,
    createCipheriv,
    createHash,
    createDecipheriv
} from 'crypto'

export type CipherGlob = {
    cipherText: string
    iv: string
    mac: string
}

export type KdfCipherGlob = CipherGlob & {
    kdf: {
        n: number
        salt: string
    }
}

/**
 * encrypt clear text into cipher glob
 * @param clearText the clear text
 * @param key the cipher key
 */
export function encrypt(clearText: Buffer, key: Buffer): CipherGlob {
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

/**
 * decrypt cipher glob
 * @param jsonGlob cipher glob
 * @param key the cipher key
 */
export function decrypt(glob: CipherGlob, key: Buffer): Buffer {
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

async function cachedKdf(password: string, salt: Buffer, n: number) {
    const cacheKey = `${blake2b256(salt, password).toString('hex')}-${n}`
    const key = kdfCache[cacheKey] || await kdf(password, salt, n)
    return {
        key: key,
        cache: () => {
            kdfCache[cacheKey] = key
        }
    }
}

/**
 * encrypt data using password
 * @param clearText the clear text
 * @param password user password
 */
export async function kdfEncrypt(clearText: Buffer, password: string): Promise<KdfCipherGlob> {
    const n = await kdfEstimateN()
    const salt = randomBytes(32)
    const { key, cache } = await cachedKdf(password, salt, n)
    cache()
    const glob = encrypt(clearText, key)
    return {
        ...glob,
        kdf: {
            salt: salt.toString('hex'),
            n
        }
    }
}

/**
 * decrypt cipher glob using password
 * error thrown if password incorrect
 * @param glob the cipher glob
 * @param password the user password
 */
export async function kdfDecrypt(glob: KdfCipherGlob, password: string): Promise<Buffer> {
    const { salt, n } = glob.kdf
    const { key, cache } = await cachedKdf(password, Buffer.from(salt, 'hex'), n)

    const clearText = decrypt(glob, key)
    cache()
    return clearText
}
