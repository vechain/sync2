import { boot } from 'quasar/wrappers'

// define filters
const filters = {
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
