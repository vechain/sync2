import { randomBytes, createHmac } from 'crypto'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const m = require('more-entropy')

const ctx: Worker = self as never

ctx.onmessage = (ev) => {
    if (ev.data[0] === 'generateKey') {
        // generates 256-bit random key which is secured by extra CPU based entropy.
        new m.Generator().generate(512, (entropy: number[]) => {
            const mac = createHmac('sha256', randomBytes(32))
            const key = mac.update(Int16Array.from(entropy)).digest()
            ctx.postMessage(Uint8Array.from(key))
        })
    }
}
