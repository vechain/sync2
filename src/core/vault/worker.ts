// codes in this file run in web worker

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')
import { Pbkdf2HmacSha256 } from 'asmcrypto.js/dist_es8/pbkdf2/pbkdf2-hmac-sha256'
import { Sha256 } from 'asmcrypto.js/dist_es8/hash/sha256/sha256'

export type CommandName = 'secureRNG' | 'kdfEstimateN' | 'kdf'
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
    return new Sha256()
        .process(new Uint8Array(entropy.buffer, entropy.byteOffset, entropy.byteLength))
        .process(self.crypto.getRandomValues(new Uint8Array(32)))
        .finish()
        .result!
        .slice(0, size)
}

/** to estimate suitable iterations */
function kdfEstimateN() {
    let n = 100000
    const pass = self.crypto.getRandomValues(new Uint8Array(8))
    const salt = self.crypto.getRandomValues(new Uint8Array(32))

    for (; ;) {
        const startTime = Date.now()
        Pbkdf2HmacSha256(pass, salt, n, 32)
        const elapse = Date.now() - startTime
        if (elapse < 400) {
            n *= 2
        } else if (elapse < 1000) {
            return n * 2
        } else {
            return n
        }
    }
}

/**
 * kdf
 * @param password user password
 * @param salt salt
 * @param n iterations
 */
function kdf(password: Uint8Array, salt: Uint8Array, n: number) {
    return Pbkdf2HmacSha256(password, salt, n, 32)
}

async function handleCommand(cmd: CommandName, arg: any) {
    switch (cmd) {
        case 'secureRNG': {
            const [size] = arg
            return secureRNG(size)
        }
        case 'kdfEstimateN': {
            return kdfEstimateN()
        }
        case 'kdf': {
            const [password, salt, n] = arg
            return kdf(password, salt, n)
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
