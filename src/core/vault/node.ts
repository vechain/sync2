import type { Entity } from './vault'
import type { Vault } from './index'
import { hdDeriveXPub, hdDeriveMnemonic, decrypt } from 'core/worker'
import { address } from 'thor-devkit'

export async function deriveNode(entity: Entity, index: number): Promise<Vault.Node> {
    if (entity.type === 'static') {
        if (index !== 0) {
            // static type vault only support 0-index node
            throw new Error('invalid node index')
        }
        const addr = address.fromPublicKey(Buffer.from(entity.pub, 'hex'))

        return {
            get address() { return addr },
            get index() { return index },
            unlock: key => decrypt(JSON.parse(entity.cipherGlob!), key)
        }
    } else {
        const node = await hdDeriveXPub(
            Buffer.from(entity.pub, 'hex'),
            Buffer.from(entity.chainCode!, 'hex'),
            index)

        return {
            get address() { return node.address },
            get index() { return index },
            unlock: async key => {
                if (!entity.cipherGlob) {
                    // no cipher glob, must be usb device
                    throw new Error('unsupported operation')
                }
                const buf = await decrypt(JSON.parse(entity.cipherGlob), key)
                const words = buf.toString('utf8').split(' ')
                return (await hdDeriveMnemonic(words, index)).privateKey
            }
        }
    }
}
