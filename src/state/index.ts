import * as Wallet from './wallet'
import * as Node from './node'

export function build() {
    return {
        wallet: Wallet.build(),
        node: Node.build()
    }
}
