import { HDNode, address } from "thor-devkit"
import * as HD from '@vechain/ethers/utils/hdnode'
const { ec: EC } = require('elliptic')
const curve = new EC('secp256k1')

export function fromMnemonic(words: string[], path: string): HDNode {
    const joinedWords = words.join(' ').toLowerCase()
    const node = HD.fromMnemonic(joinedWords).derivePath(path)
    return createHDNode(node)
}

function createHDNode(ethersNode: HD.HDNode): HDNode {
    const pub = Buffer.from(curve.keyFromPublic(ethersNode.publicKey.slice(2), 'hex').getPublic(false, 'array'))
    const priv = ethersNode.privateKey ? Buffer.from(ethersNode.privateKey.slice(2), 'hex') : null
    const cc = Buffer.from(ethersNode.chainCode.slice(2), 'hex')
    const addr = address.fromPublicKey(pub)

    return {
        get publicKey() {
            return pub
        },
        get privateKey() {
            return priv
        },
        get chainCode() {
            return cc
        },
        get address() {
            return addr
        },
        derive(index) {
            return createHDNode(ethersNode.derivePath('' + index))
        }
    }
}
