import { boot } from 'quasar/wrappers'
import { address } from 'thor-devkit'
import { BigNumber } from 'bignumber.js'
import { format } from 'timeago.js'

// define filters
const filters = {
    /** convert genesis id to network name */
    net: (gid: string) => {
        if (gid === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a') {
            return 'main'
        } else if (gid === '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127') {
            return 'test'
        }
        return 'private'
    },
    /**
     * convert s into abbreviation, where l1 l2 specifies length of head and tail
     */
    abbrev: (s: string, l1 = 6, l2 = 4) => {
        if (s.length <= l1 + l2) {
            return s
        }
        return s.slice(0, l1) + '⋯' + s.slice(-l2)
    },
    /** convert the address into checksum format */
    checksum: (addr: string) => {
        return address.toChecksumed(addr)
    },
    /** convert balance from unit WEI to common unit */
    balance: (v: string | number, decimal = 18, digits = 2) => {
        if (typeof v !== 'string' && typeof v !== 'number') {
            return new BigNumber(0).toFormat(digits).replace(/0/g, '-')
        }
        return new BigNumber(v)
            .div(new BigNumber('1' + '0'.repeat(decimal)))
            .toFormat(digits)
    },
    /** convert balance from common unit to unit WEI hax string */
    toWei: (val: string, decimals = 18) => {
        const x = new BigNumber(`1e+${decimals}`)
        const temp = new BigNumber(val)
        return '0x' + new BigNumber(temp.multipliedBy(x).toFixed(0, BigNumber.ROUND_DOWN)).toString(16)
    },
    dateTime: (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            year: 'numeric',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    },
    ago: (timestamp: number) => {
        return format(timestamp * 1000)
    },
    urlHost: (url: string) => {
        let result = ''
        try {
            result = url ? new URL(url).host : ''
        } catch (e) { console.log(e) }
        return result
    }
}

export default boot(({ Vue }) => {
    Object.entries(filters).forEach(([name, fn]) => {
        Vue.filter(name, fn)
    })
})
