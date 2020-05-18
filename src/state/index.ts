import * as Wallet from './wallet'
import * as Network from './network'

export function build() {
    return {
        wallet: Wallet.build(),
        network: Network.build()
    }
}
