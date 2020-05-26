import * as Wallet from './wallet'
import * as Config from './config'

export function build() {
    return {
        wallet: Wallet.build(),
        config: Config.build()
    }
}
