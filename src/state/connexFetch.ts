import { retain, ConnexRef } from 'core/connex/pool'

type Node = {
    gid: string
    url: string
}

const vip180balanceOf = {
    constant: true,
    inputs: [
        {
            name: '_owner',
            type: 'address'
        }
    ],
    name: 'balanceOf',
    outputs: [
        {
            name: 'balance',
            type: 'uint256'
        }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
}

let _connexRef: ConnexRef | null = null

function stop() {
    _connexRef && _connexRef.release()
    _connexRef = null
}

async function BalanceFetch(node: Node) {
    stop()
    _connexRef = await retain(node)
    const connex = _connexRef.connex
    return {
        stop,
        getAccountsBalance(addrs: string[], cb: (addr: string, symbol: string, balance: string) => void) {
            addrs.forEach(addr => {
                connex.thor.account(addr).get().then(account => {
                    cb(addr, 'VET', account.balance)
                    cb(addr, 'VTHO', account.energy)
                })
            })
        },
        getTokenBalance(addr: string, tokens: M.TokenSpec[], cb: (addr: string, symbol: string, balance: string) => void) {
            tokens.forEach(token => {
                connex.thor.account(token.address)
                    .method(vip180balanceOf)
                    .cache([addr])
                    .call(addr)
                    .then(output => {
                        cb(addr, token.symbol, output.decoded!.balance)
                    })
            })
        }
    }
}

export default BalanceFetch
