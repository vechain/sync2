import { boot } from 'quasar/wrappers'
import { BigNumber } from 'bignumber.js'

// define filters
const filters = {
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
    }
}

export default boot(({ Vue }) => {
    Object.entries(filters).forEach(([name, fn]) => {
        Vue.filter(name, fn)
    })
})
