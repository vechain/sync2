import Vue from 'vue'
import { abis } from 'src/consts'

export default Vue.extend({
    props: {
        gid: String
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor },
        addresses(): string[] {
            if (!this.wallets) {
                return []
            }
            return Array.from(this.wallets.reduce<Set<string>>((prev, cur) => {
                cur.meta.addresses.forEach(a => prev.add(a))
                return prev
            }, new Set()))
        },
        // compose vet transfer criteria
        transferCriteria(): Connex.Thor.Filter.Criteria<'transfer'>[] {
            return this.addresses.reduce<Connex.Thor.Filter.Criteria<'transfer'>[]>((prev, cur) => {
                prev.push({ sender: cur }, { recipient: cur })
                return prev
            }, [])
        },
        // compose token transfer criteria
        eventCriteria(): Connex.Thor.Filter.Criteria<'event'>[] {
            const tokens = this.tokens
            if (!tokens) {
                return []
            }
            return this.addresses.reduce<Connex.Thor.Filter.Criteria<'event'>[]>((prev, cur) => {
                tokens.forEach(spec => {
                    const ev = this.thor
                        .account(spec.address)
                        .event(abis.transferEvent)
                    prev.push(
                        ev.asCriteria({ _from: cur }),
                        ev.asCriteria({ _to: cur }))
                })
                return prev
            }, [])
        }
    },
    asyncComputed: {
        wallets(): Promise<M.Wallet[] | null> {
            return this.$svc.wallet.getByGid(this.gid)
        },
        async tokens(): Promise<M.TokenSpec[] | null> {
            const [tokens, activeSymbols] = await Promise.all([
                this.$svc.config.token.all(),
                this.$svc.config.token.activeSymbols()
            ])
            return tokens.filter(token =>
                token.address && // exclude vet
                token.gid === this.gid &&
                (activeSymbols.includes(token.symbol) || token.permanent))
        },
        // vet transfers
        transfers(): Promise<Connex.Thor.Filter.Row<'transfer'>[] | null> {
            return this.guardRange('transfer', range => {
                const criteria = this.transferCriteria
                if (criteria.length === 0) {
                    return Promise.resolve([])
                }

                return this.thor.filter('transfer', criteria)
                    .cache(this.addresses)
                    .range(range)
                    .apply(0, 10)
            })
        },
        // token transfers
        events(): Promise<Connex.Thor.Filter.Row<'event'>[] | null> {
            return this.guardRange('event', range => {
                const criteria = this.eventCriteria
                if (criteria.length === 0) {
                    return Promise.resolve([])
                }

                return this.thor.filter('event', criteria)
                    .cache(this.addresses)
                    .range(range)
                    .apply(0, 10)
            })
        }
    },
    watch: {
        transfers(newVal: Connex.Thor.Filter.Row<'transfer'>[] | null) {
            newVal && newVal.forEach(() => {
            })
        },
        events(newVal: Connex.Thor.Filter.Row<'event'>[] | null) {
            newVal && newVal.forEach(() => {
            })
        }
    },
    methods: {
        // provides stored range for the query
        async guardRange<T extends Connex.Thor.Filter.WithMeta>(kind: string, query: (range: Connex.Thor.Filter.Range) => Promise<T[]>): Promise<T[]> {
            const key = `notifier-query-range-start_${kind}`

            const headNum = this.thor.status.head.number
            const savedRange = localStorage.getItem(key)
            const rangeStart = parseInt(savedRange!) || headNum
            if (rangeStart === 0) {
                return []
            }

            const result = await query({ unit: 'block', from: rangeStart, to: 2 ** 32 - 1 })
            if (result.length > 0) {
                localStorage.setItem(key, (result[result.length - 1].meta.blockNumber + 1).toString())
            } else if (!savedRange || headNum > rangeStart + 100) {
                localStorage.setItem(key, headNum.toString())
            }
            return result
        }
    },
    render(h) {
        return h()
    }
})
