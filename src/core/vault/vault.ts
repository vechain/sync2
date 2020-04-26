
import type { Vault } from './index'
import { CipherGlob, decrypt, encrypt } from './cipher'
import { deriveNode } from './node'

export type Entity = {
    type: Vault.Type
    pub: string
    chainCode?: string
    cipherGlob?: CipherGlob
}

export function newVault(salt: Buffer, entity: Entity): Vault {
    const vault: Vault = {
        get type() { return entity.type },
        derive: index => {
            return deriveNode(salt, entity, index)
        },
        decrypt: async password => {
            if (entity.type === 'usb') {
                throw new Error('unsupported operation')
            }
            const key = await decrypt(entity.cipherGlob!, password, salt)
            if (entity.type === 'sk') {
                return key
            }
            return key.toString('utf8')
        },
        clone: async (password, newPassword) => {
            if (entity.type === 'usb') {
                throw new Error('unsupported operation')
            }
            const key = await decrypt(entity.cipherGlob!, password, salt)
            return newVault(salt, {
                ...entity,
                cipherGlob: await encrypt(key, newPassword, salt)
            })
        },
        encode: () => JSON.stringify(entity)
    }
    return vault
}
