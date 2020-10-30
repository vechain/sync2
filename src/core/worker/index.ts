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

let nextSeq = 0

/**
 * convenient method for calling functions in web worker
 * @param cmd the command name
 * @param args command arguments
 */
function call<R>(cmd: string, ...args: unknown[]): Promise<R> {
    const seq = ++nextSeq
    // args are passed in tuple
    worker.postMessage([seq, cmd, args])
    const r = new Deferred<unknown>()
    queue.set(seq, r)
    return r as Promise<R>
}

/** generate 256-bit salt */
export function generateSalt() {
    return call<Uint8Array>('generateSalt')
        .then(r => Buffer.from(r))
}

/**
 * encrypt clear text into JSON encoded cipher glob
 * @param clearText the clear text
 * @param password user password
 * @param salt the kdf salt
 * @returns cipher glob
 */
export function encrypt(clearText: Buffer, password: string, salt: Buffer): Promise<string> {
    return call<string>('encrypt', clearText, password, salt)
}

/**
 * decrypt JSON encoded cipher glob
 * @param jsonGlob cipher glob
 * @param password user password
 * @param salt the kdf salt
 * @returns the decrypted data
 */
export function decrypt(jsonGlob: string, password: string, salt: Buffer): Promise<Buffer> {
    return call<Uint8Array>('decrypt', jsonGlob, password, salt)
        .then(r => Buffer.from(r))
}

/**
 * generate mnemonic words
 * @param len entropy length in bytes. every 4 bytes produce 3 words
 */
export function hdGenerateMnemonic(len = 32) {
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
