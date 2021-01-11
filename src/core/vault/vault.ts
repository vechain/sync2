
import type { Vault } from './index'
import { deriveNode } from './node'
import { decrypt } from 'core/worker'

export type Entity = {
    type: Vault.Type
    pub: string
    chainCode?: string
    cipherGlob?: string
}

export function newVault(entity: Entity): Vault {
    return {
        get type() { return entity.type },
        derive: index => deriveNode(entity, index),
        decrypt: async key => {
            if (!entity.cipherGlob) {
                // usb type has no cipher glob
                throw new Error('unsupported operation')
            }
            const clearText = await decrypt(JSON.parse(entity.cipherGlob), key)
            // be aware that hd key is utf-8 encoded
            return entity.type === 'hd' ? clearText.toString('utf8') : clearText
        },
        encode: () => JSON.stringify(entity)
    }
}
