import axios from 'axios'
import { blake2b256 } from 'thor-devkit'

type Context = {
    retries: number
}

const ongoings = new Map<string, Context>() // tx hash to context

export function commitTx(nodeUrl: string, raw: string) {
    const hash = blake2b256(raw, nodeUrl).toString('hex')
    let ctx = ongoings.get(hash)
    if (ctx) {
        ctx.retries = 0
    } else {
        ongoings.set(hash, ctx = {
            retries: 0
        })
        void (async () => {
            try {
                const url = new URL('transactions', nodeUrl).href
                const data = Buffer.from(JSON.stringify({ raw }))
                while (ctx.retries++ < 5) {
                    try {
                        await axios.post(url, data, {
                            headers: { 'content-type': 'application/json' },
                            timeout: 15 * 1000
                        })
                        return
                    } catch (err) {
                        await new Promise(resolve => setTimeout(resolve, 10000))
                    }
                }
            } finally {
                ongoings.delete(hash)
            }
        })()
    }
}
