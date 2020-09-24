import StackedRouterView from './StackedRouterView.vue'
import AddressCard from './AddressCard.vue'
import ConnexObject from './ConnexObject'
import ConnexContinuous from './ConnexContinuous'
import PinCode from './PinCode.vue'
import ConfirmedPinCodeInput from './ConfirmedPinCodeInput.vue'
import SlideContainer from './SlideContainer.vue'
import Drawer from './Drawer.vue'
import WalletItem from './WalletItem.vue'
import Intersecting from './Intersecting.vue'
import DigitKeypad from './DigitKeypad.vue'
import QRCode from './QRCode.vue'
import TokenBalanceItem from './TokenBalanceItem.vue'
import Async from './Async'
import ClauseCard from './ClauseCard.vue'
import SlideBtn from './SlideBtn.vue'
import AddressAvatar from './AddressAvatar.vue'
import AccountList from './AccountList.vue'
import AccountSelector from './AccountSelector.vue'
import BalanceList from './BalanceList.vue'
import Priority from './Priority.vue'
import Delay from './Delay'
import TokenSelector from './TokenSelector.vue'
import LogItem from './LogItem.vue'
import Logs from './Logs.vue'
import ReceiveDialog from './ReceiveDialog.vue'
import AddressInfo from './AddressInfo.vue'

const components: { [name: string]: Vue.VueConstructor } = {
    StackedRouterView,
    AddressCard,
    ConnexObject,
    ConnexContinuous,
    PinCode,
    ConfirmedPinCodeInput,
    SlideContainer,
    Drawer,
    WalletItem,
    Intersecting,
    DigitKeypad,
    QRCode,
    TokenBalanceItem,
    Async,
    ClauseCard,
    SlideBtn,
    AddressAvatar,
    AccountList,
    AccountSelector,
    Priority,
    Delay,
    BalanceList,
    TokenSelector,
    LogItem,
    Logs,
    ReceiveDialog,
    AddressInfo
}

export default components
