
import type { Vault } from './index'
import { deriveNode } from './node'
import { decrypt, encrypt } from '../worker'

export type Entity = {
    type: Vault.Type
    pub: string
    chainCode?: string
    cipherGlob?: string
}

export function newVault(salt: Buffer, entity: Entity): Vault {
    return {
        get type() { return entity.type },
        derive: index => deriveNode(salt, entity, index),
        decrypt: async password => {
            if (!entity.cipherGlob) {
                // usb type has no cipher glob
                throw new Error('unsupported operation')
            }
            const key = await decrypt(entity.cipherGlob, password, salt)
            // be aware that hd key is utf-8 encoded
            return entity.type === 'hd' ? key.toString('utf8') : key
        },
        clone: async (password, newPassword) => {
            if (!entity.cipherGlob) {
                throw new Error('unsupported operation')
            }
            const key = await decrypt(entity.cipherGlob, password, salt)
            return newVault(salt, {
                ...entity,
                cipherGlob: await encrypt(key, newPassword, salt)
            })
        },
        encode: () => JSON.stringify(entity)
    }
}
