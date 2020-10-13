import * as Wallet from './wallet'
import * as Config from './config'
import * as Activity from './activity'

export function build() {
    return {
        wallet: Wallet.build(),
        config: Config.build(),
        activity: Activity.build()
    }
}
