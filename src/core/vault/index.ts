import { CipherGlob, encrypt, decrypt } from './cipher'
import { publicKeyToAddress } from 'thor-devkit/dist/cry/address'
import { secp256k1 } from 'thor-devkit/dist/cry/secp256k1'
import { blake2b256 } from 'thor-devkit/dist/cry/blake2b'
import { HDNode } from 'thor-devkit/dist/cry/hdnode'
import { mnemonic } from 'thor-devkit/dist/cry/mnemonic'
import { generate } from '../key-generator'

interface VaultFactory {
    generateMnemonic(): Promise<string>

    encryptHD(words: string, password: string): Promise<Vault>
    encryptSK(sk: Buffer, password: string): Promise<Vault>

    load(encoded: string): Promise<Vault>
}

type Entity = {
    type: Vault.Type
    pub: string
    chainCode?: string
    cipherGlob?: CipherGlob
}

function newNode(salt: Buffer, entity: Entity, index: number): Vault.Node {
    if (entity.type === 'sk') {
        if (index !== 0) {
            throw new Error('invalid node index')
        }
        const addr = '0x' + publicKeyToAddress(Buffer.from(entity.pub, 'hex')).toString('hex')
        return {
            get address() { return addr },
            get index() { return index },
            sign: async (msg, password) => {
                const key = await decrypt(entity.cipherGlob!, password, salt)
                const sig = secp256k1.sign(blake2b256(msg), key)
                key.fill(0)
                return sig
            }
        }
    } else {
        const n = HDNode.fromPublicKey(
            Buffer.from(entity.pub, 'hex'),
            Buffer.from(entity.chainCode!, 'hex'))
            .derive(index)
        return {
            get address() { return n.address },
            get index() { return index },
            sign: async (msg, password) => {
                const buf = await decrypt(entity.cipherGlob!, password, salt)
                const words = buf.toString('utf8').split(' ')
                const key = HDNode.fromMnemonic(words)
                    .derive(index)
                    .privateKey!
                const sig = secp256k1.sign(blake2b256(msg), key)
                key.fill(0)
                return sig
            }
        }
    }
}

function newVault(salt: Buffer, entity: Entity): Vault {
    const vault: Vault = {
        get type() { return entity.type },
        node: index => {
            return newNode(salt, entity, index)
        },
        decrypt: async password => {
            if (entity.type === 'usb') {
                return ''
            }
            const key = await decrypt(entity.cipherGlob!, password, salt)
            if (entity.type === 'sk') {
                return key
            }
            return key.toString('utf8')
        },
        clone: async (password, newPassword) => {
            if (entity.type === 'usb') {
                return vault
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

export function newFactory(salt: Buffer): VaultFactory {
    return {
        generateMnemonic: async () => {
            const key = await generate()
            const words = mnemonic.generate(() => key)
            return words.join(' ')
        },
        encryptHD: async (words, password) => {
            const root = HDNode.fromMnemonic(words.split(' '))
            const glob = await encrypt(Buffer.from(words, 'utf8'), password, salt)
            return newVault(salt, {
                type: 'hd',
                pub: root.publicKey.toString('hex'),
                chainCode: root.chainCode.toString('hex'),
                cipherGlob: glob
            })
        },
        encryptSK: async (sk, password) => {
            const glob = await encrypt(sk, password, salt)
            return newVault(salt, {
                type: 'sk',
                pub: secp256k1.derivePublicKey(sk).toString('hex'),
                cipherGlob: glob
            })
        },
        load: (encoded) => {
            const entity = JSON.parse(encoded)
            return Promise.resolve(newVault(salt, entity))
        }
    }
}
