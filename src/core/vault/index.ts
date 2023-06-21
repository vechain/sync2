import { mnemonic, secp256k1, HDNode } from 'thor-devkit'
import { newVault } from './vault'
import { encrypt, secureRNG } from './cipher'

export * from './cipher'

/** describes the secure container holds wallet key */
export interface Vault {
    /**
     * derives a new vault node, which corresponds to an address.
     * @param index node index start from 0
     * @returns derived node instance
     */
    derive(index: number): Vault.Node

    /**
     * decrypt the vault
     * @param key the cipher key
     * @returns clear vault content
     */
    decrypt(key: Buffer): Buffer

    /** encode the vault into string */
    encode(): string
}

export namespace Vault {
    /** the vault node corresponds to an address */
    export interface Node {
        readonly address: string
        readonly index: number
        /**
         * unlock the node and expose its private key
         * @param key the cipher key
         * @returns the private key
         */
        unlock(key: Buffer): Buffer
    }

    /**
     * generate a new group of mnemonic words
     * @param len entropy length in bytes. every 4 bytes produce 3 words.
     * @returns generated mnemonic words
     */
    export async function generateMnemonic(len = 32): Promise<string[]> {
        if (len < 16 || len > 32 || len % 4 !== 0) {
            throw new Error('invalid arg')
        }
        const rnd = await secureRNG(len)
        return mnemonic.generate(() => rnd)
    }

    /**
     * decode the data encoded by .encode and create a vault instance
     * @param data encoded data
     * @returns vault instance
     */
    export function decode(data: string): Vault {
        const entity = JSON.parse(data)
        return newVault(entity)
    }

    /**
     * create a HD vault
     * @param words mnemonic words
     * @param key the cipher key
     */
    // eslint-disable-next-line quotes
    export function createHD(words: string[], key: Buffer, path = `m/44'/818'/0'/0`): Vault {
        const root = HDNode.fromMnemonic(words, path)
        // be aware that hd key is utf-8 encoded
        const clearText = Buffer.from(words.join(' '), 'utf8')
        const glob = encrypt(clearText, key)
        return newVault({
            pub: root.publicKey.toString('hex'),
            chainCode: root.chainCode.toString('hex'),
            cipherGlob: JSON.stringify(glob),
            path
        })
    }

    /**
     * create static key vault
     * @param sk the private key
     * @param key the cipher key
     */
    export function createStatic(sk: Buffer, key: Buffer): Vault {
        const glob = encrypt(sk, key)
        return newVault({
            pub: secp256k1.derivePublicKey(sk).toString('hex'),
            cipherGlob: JSON.stringify(glob)
        })
    }

    /**
     * create a vault bound to USB device
     * @param pub public key
     * @param chainCode chain code
     */
    export function createUSB(pub: Buffer, chainCode: Buffer): Vault {
        return newVault({
            pub: pub.toString('hex'),
            chainCode: chainCode.toString('hex')
        })
    }
}
