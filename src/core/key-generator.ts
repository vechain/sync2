import { randomBytes, createHmac } from 'crypto'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')

/**
 * generates 256-bit random key which is secured by extra CPU based entropy.
 */
export async function generate() {
    const mac = createHmac('sha256', randomBytes(32))
    for (let i = 0; i < 16; i++) {
        const val = await new Promise<number[]>(resolve => {
            new m.Generator().generate(64, resolve)
        })
        mac.update(Int32Array.from(val))
    }
    return mac.digest()
}
