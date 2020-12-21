import StackedRouterView from './StackedRouterView.vue'
import PinCode from './PinCode.vue'
import ConfirmedPinCodeInput from './ConfirmedPinCodeInput.vue'
import SlideContainer from './SlideContainer.vue'
import Drawer from './Drawer.vue'
import Intersecting from './Intersecting.vue'
import DigitKeypad from './DigitKeypad.vue'
import QRCode from './QRCode.vue'
import TokenBalanceItem from './TokenBalanceItem.vue'
import SlideBtn from './SlideBtn.vue'
import AddressAvatar from './AddressAvatar.vue'
import Delay from './Delay'
import AddressInfo from './AddressInfo.vue'
import InputPinCode from './InputPinCode.vue'
import PageToolbar from './PageToolbar.vue'
import Resolve from './Resolve'

const components: { [name: string]: Vue.VueConstructor } = {
    StackedRouterView,
    PinCode,
    ConfirmedPinCodeInput,
    SlideContainer,
    Drawer,
    Intersecting,
    DigitKeypad,
    QRCode,
    TokenBalanceItem,
    SlideBtn,
    AddressAvatar,
    Delay,
    AddressInfo,
    InputPinCode,
    PageToolbar,
    Resolve
}

export default components
