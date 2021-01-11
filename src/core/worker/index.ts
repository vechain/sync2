import Worker from 'worker-loader!./handler'
import { Deferred } from 'src/utils/deferred'

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

export type CommandName = 'secureRNG' | 'kdfEncrypt' | 'kdfDecrypt' | 'encrypt' | 'decrypt' | 'hdGenerateMnemonic' | 'hdDeriveMnemonic' | 'hdDeriveXPub'

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

/**
 * encrypt data using password
 * @param clearText the clear text
 * @param password user password
 */
export function kdfEncrypt(clearText: Buffer, password: string): Promise<KdfCipherGlob> {
    return call('kdfEncrypt', clearText, password)
}

/**
 * decrypt cipher glob using password
 * @param glob the cipher glob
 * @param password the user password
 */
export function kdfDecrypt(glob: KdfCipherGlob, password: string): Promise<Buffer> {
    return call<Uint8Array>('kdfDecrypt', glob, password)
        .then(r => Buffer.from(r))
}

/**
 * encrypt clear text into cipher glob
 * @param clearText the clear text
 * @param key the cipher key
 */
export function encrypt(clearText: Buffer, key: Buffer): Promise<CipherGlob> {
    return call('encrypt', clearText, key)
}

/**
 * decrypt cipher glob
 * @param jsonGlob cipher glob
 * @param key the cipher key
 */
export function decrypt(glob: CipherGlob, key: Buffer): Promise<Buffer> {
    return call<Uint8Array>('decrypt', glob, key)
        .then(r => Buffer.from(r))
}

/**
 * generate mnemonic words
 * @param len entropy length in bytes. every 4 bytes produce 3 words
 */
export function hdGenerateMnemonic(len = 32): Promise<string[]> {
    return call<string[]>('hdGenerateMnemonic', len)
}

/**
 * derive HD node from mnemonic words
 * @param words mnemonic words
 * @param index child node index to be derived. (in case of index < 0, root node is returned)
 * @returns {pub, chainCode, address, privateKey}
 */
export function hdDeriveMnemonic(words: string[], index: number) {
    return call<[Uint8Array, Uint8Array, string, Uint8Array]>('hdDeriveMnemonic', words, index)
        .then(r => {
            const [pub, chainCode, address, privateKey] = r
            return {
                pub: Buffer.from(pub),
                chainCode: Buffer.from(chainCode),
                address,
                privateKey: Buffer.from(privateKey)
            }
        })
}

/**
 * derive HD node from xpub
 * @param pub public key
 * @param chainCode chain code
 * @param index child node index to be derived.
 * @returns {pub, chainCode, address}
 */
export function hdDeriveXPub(pub: Buffer, chainCode: Buffer, index: number) {
    return call<[Uint8Array, Uint8Array, string]>('hdDeriveXPub', pub, chainCode, index)
        .then(r => {
            const [pub, chainCode, address] = r
            return {
                pub: Buffer.from(pub),
                chainCode: Buffer.from(chainCode),
                address
            }
        })
}
