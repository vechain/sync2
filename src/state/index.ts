import * as Wallet from './wallet'

export function build() {
    return {
        wallet: Wallet.build()
    }
}
