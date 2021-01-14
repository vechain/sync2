import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

export function decimalSeparator() {
    return BigNumber.config(undefined as unknown as {}).FORMAT!.decimalSeparator!
}

export type FormatAmountOptions = {
    unit?: number
    fixed?: number
    fullPrecision?: boolean
}

export type FormatAmountResult = {
    int: string
    dec?: string
    sep: string
}

export function formatAmount(val: BigNumber.Value, opts?: FormatAmountOptions): FormatAmountResult | null {
    try {
        opts = opts || {}
        let bn = new BigNumber(val)
        if (opts.unit) {
            bn = bn.div('1' + '0'.repeat(opts.unit))
        }

        // NaN or Infinite is not valid
        if (!bn.isFinite()) {
            return null
        }

        const sep = decimalSeparator()

        if (opts.fullPrecision) {
            const [int, dec] = bn.toFormat().split(sep)
            if (typeof opts.fixed !== 'number' || opts.fixed <= 0) {
                return { int, dec, sep }
            }
            if (dec) {
                if (dec.length < opts.fixed) {
                    return { int, dec: dec + '0'.repeat(opts.fixed - dec.length), sep }
                }
                return { int, dec, sep }
            }

            return { int, dec: '0'.repeat(opts.fixed), sep }
        }

        const [int, dec] = (typeof opts.fixed === 'number' ? bn.toFormat(opts.fixed, BigNumber.ROUND_FLOOR) : bn.toFormat()).split(sep)
        return { int, dec, sep }
    } catch {
        return null
    }
}

export function toWei(v: string, decimals: number) {
    return new BigNumber(v)
        .times(`1${'0'.repeat(decimals)}`)
        .toFixed(0, BigNumber.ROUND_FLOOR)
}

export type FormatDateOptions = {
    relative?: boolean
}

export function formatDate(date: number, opts?: FormatDateOptions) {
    opts = opts || {}
    const relativeBreak = 3600 * 1000 // in 1hours
    if (opts.relative && Date.now() < date + relativeBreak) {
        return dayjs(date).toNow()
    } else {
        return dayjs(date).format('L HH:mm:ss')
    }
}
