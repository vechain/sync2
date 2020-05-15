import { secp256k1 } from 'thor-devkit/dist/cry/secp256k1'
import { init as initSalt } from './salt'
import { newVault } from './vault'
import { hdGenerateMnemonic, hdDeriveMnemonic, encrypt, decrypt } from 'core/worker'
import { randomBytes } from 'crypto'

/** describes the secure container holds wallet key */
export interface Vault {
    readonly type: Vault.Type

    /**
     * derives a new vault node, which corresponds to an account.
     * @param index node index start from 0
     * @returns derived node instance
     */
    derive(index: number): Promise<Vault.Node>

    /**
     * decrypt the vault into wallet key
     * @param password user password
     * @returns clear wallet key
     */
    decrypt(password: string): Promise<string | Buffer>

    /**
     * clone to a new vault with new password
     * @param password user password
     * @param newPassword user password for the cloned vault
     * @returns the cloned vault
     */
    clone(password: string, newPassword: string): Promise<Vault>

    /** encode the vault into string */
    encode(): string
}

export namespace Vault {
    /**
     * hd: hierarchical deterministic
     * static: non-HD, static private key
     * usb: external USB device
     */
    export type Type = 'hd' | 'static' | 'usb'

    /** the vault node corresponds to an account */
    export interface Node {
        readonly address: string
        readonly index: number
        /**
         * unlock the node and expose its private key
         * @param password user password
         * @returns the private key
         */
        unlock(password: string): Promise<Buffer>
    }

    /**
     * generate the password shadow, which is the cipher text of random bytes encrypted
     * by user password
     * @param password user password
     * @returns password shadow
     */
    export async function shadowPassword(password: string) {
        const salt = await initSalt()
        const glob = await encrypt(randomBytes(32), password, salt)
        return glob
    }

    /**
     * verify use password against the given password shadow
     * @param shadow the password shadow
     * @param password use password
     */
    export async function verifyPassword(shadow: string, password: string) {
        const salt = await initSalt()
        await decrypt(shadow, password, salt)
    }

    /**
     * generate a new group of mnemonic words
     * @param len entropy length in bytes. every 4 bytes produce 3 words.
     * @returns generated mnemonic words
     */
    export function generateMnemonic(len = 32): Promise<string[]> {
        if (len < 16 || len > 32 || len % 4 !== 0) {
            throw new Error('invalid arg')
        }
        return hdGenerateMnemonic(len)
    }

    /**
     * decode the data encoded by .encode and create a vault instance
     * @param data encoded data
     * @returns vault instance
     */
    export async function decode(data: string): Promise<Vault> {
        const salt = await initSalt()
        const entity = JSON.parse(data)
        return newVault(salt, entity)
    }

    /**
     * create a HD vault
     * @param words mnemonic words
     * @param password user password
     */
    export async function createHD(words: string[], password: string): Promise<Vault> {
        const salt = await initSalt()
        const root = await hdDeriveMnemonic(words, -1)
        // be aware that hd key is utf-8 encoded
        const clearText = Buffer.from(words.join(' '), 'utf8')
        const glob = await encrypt(clearText, password, salt)
        return newVault(salt, {
            type: 'hd',
            pub: root.pub.toString('hex'),
            chainCode: root.chainCode.toString('hex'),
            cipherGlob: glob
        })
    }

    /**
     * create static key vault
     * @param sk the private key
     * @param password user password
     */
    export async function createStatic(sk: Buffer, password: string): Promise<Vault> {
        const salt = await initSalt()
        const glob = await encrypt(sk, password, salt)
        return newVault(salt, {
            type: 'static',
            pub: secp256k1.derivePublicKey(sk).toString('hex'),
            cipherGlob: glob
        })
    }

    /**
     * create a vault bound to USB device
     * @param pub public key
     * @param chainCode chain code
     */
    export function createUSB(pub: Buffer, chainCode: Buffer): Promise<Vault> {
        return Promise.resolve(newVault(Buffer.from([]), {
            type: 'usb',
            pub: pub.toString('hex'),
            chainCode: chainCode.toString('hex')
        }))
    }
}
