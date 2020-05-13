import { boot } from 'quasar/wrappers'
import State from 'src/state'

export default boot(({ Vue }) => {
    Vue.use(State)
})
