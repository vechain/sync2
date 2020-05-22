import StackedRouterView from './StackedRouterView.vue'
import AddressCard from './AddressCard.vue'
import AddressCarousel from './AddressCarousel.vue'
import Tokens from './Tokens.vue'
import MainDrawerContent from './MainDrawerContent.vue'
import ConnexObject from './ConnexObject'
import ConnexContinuous from './ConnexContinuous'

const components: { [name: string]: Vue.VueConstructor } = {
    StackedRouterView,
    AddressCard,
    AddressCarousel,
    Tokens,
    MainDrawerContent,
    ConnexObject,
    ConnexContinuous
}

export default components
