import StackedRouterView from './StackedRouterView.vue'
import Drawer from './Drawer.vue'
import Intersecting from './Intersecting.vue'
import QRCode from './QRCode.vue'
import TokenBalanceItem from './TokenBalanceItem.vue'
import AddressAvatar from './AddressAvatar.vue'
import Delay from './Delay'
import AddressInfo from './AddressInfo.vue'
import PageToolbar from './PageToolbar.vue'
import Resolve from './Resolve'

const components: { [name: string]: Vue.VueConstructor } = {
    StackedRouterView,
    Drawer,
    Intersecting,
    QRCode,
    TokenBalanceItem,
    AddressAvatar,
    Delay,
    AddressInfo,
    PageToolbar,
    Resolve
}

export default components
