import axios from 'axios'
import { boot } from 'quasar/wrappers'

class Request {
    private static readonly MAX_RETRIES = 5
    private retries = 0

    private sent = false
    private requesting = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private timer?: any

    constructor(
        readonly url: string,
        readonly rawTx: string
    ) { }

    public send() {
        this.retries = 0
        this.sent = false
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = undefined
        }
        if (this.requesting) {
            return
        }
        this.post()
    }

    public get status() {
        if (this.sent) {
            return 'sent'
        }
        if (this.retries >= Request.MAX_RETRIES) {
            return 'error'
        }
        return 'sending'
    }

    private post() {
        this.requesting = true
        axios.post(this.url, Buffer.from(JSON.stringify({ raw: this.rawTx })), {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10 * 1000
        }).then(() => {
            this.sent = true
        }).catch((error) => {
            console.log(error.message)
            this.retries++
            if (this.retries < Request.MAX_RETRIES) {
                this.timer = setTimeout(() => {
                    this.timer = undefined
                    this.post()
                }, 10 * 1000)
            }
        }).finally(() => {
            this.requesting = false
        })
    }
}

class Txer {
    private map = new Map<string, Request>()

    public request(id: string, url: string, raw: string) {
        let r = this.map.get(id)
        if (!r) {
            r = new Request(url, raw)
            r.send()
        }
        this.map.set(id, r)
    }

    public status(id: string) {
        const item = this.map.get(id)
        return item ? item.status : undefined
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $txer: Txer
    }
}

export default boot(({ Vue }) => {
    Vue.prototype.$txer = new Txer()
})
