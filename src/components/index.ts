import StackedRouterView from './StackedRouterView.vue'
import Drawer from './Drawer.vue'
import Intersecting from './Intersecting.vue'
import QRCode from './QRCode.vue'
import TokenBalanceItem from './TokenBalanceItem.vue'
import AddressAvatar from './AddressAvatar.vue'
import AddressInfo from './AddressInfo.vue'
import PageToolbar from './PageToolbar.vue'

const components: { [name: string]: Vue.VueConstructor } = {
    StackedRouterView,
    Drawer,
    Intersecting,
    QRCode,
    TokenBalanceItem,
    AddressAvatar,
    AddressInfo,
    PageToolbar
}

export default components
