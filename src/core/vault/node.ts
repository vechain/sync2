import type { Entity } from './vault'
import type { Vault } from './index'
import { decrypt } from './cipher'
import { deriveAddress, derivePrivateKey } from '../worker'
import { publicKeyToAddress } from 'thor-devkit/dist/cry/address'

export async function deriveNode(salt: Buffer, entity: Entity, index: number): Promise<Vault.Node> {
    if (entity.type === 'sk') {
        if (index !== 0) {
            throw new Error('invalid node index')
        }
        const addr = '0x' + publicKeyToAddress(Buffer.from(entity.pub, 'hex')).toString('hex')
        return {
            get address() { return addr },
            get index() { return index },
            unlock: password => {
                return decrypt(entity.cipherGlob!, password, salt)
            }
        }
    } else {
        const addr = await deriveAddress(Buffer.from(entity.pub, 'hex'), Buffer.from(entity.chainCode!, 'hex'), index)
        return {
            get address() { return addr },
            get index() { return index },
            unlock: async password => {
                if (entity.cipherGlob) {
                    const buf = await decrypt(entity.cipherGlob, password, salt)
                    const words = buf.toString('utf8').split(' ')
                    return derivePrivateKey(words, index)
                }
                throw new Error('unsupported operation')
            }
        }
    }
}
