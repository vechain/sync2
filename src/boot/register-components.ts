import { boot } from 'quasar/wrappers'
import components from '../components'

export default boot(({ Vue }) => {
    for (const name in components) {
        Vue.component(name, components[name])
    }
})
