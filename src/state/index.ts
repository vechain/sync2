import * as Wallet from './wallet'
import * as Config from './config'
import * as Balance from './balance'

export function build() {
    return {
        wallet: Wallet.build(),
        config: Config.build(),
        balance: Balance.build()
    }
}
