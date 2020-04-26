import { createHmac, randomBytes } from 'crypto'
import { mnemonic } from 'thor-devkit/dist/cry/mnemonic'
import { HDNode } from 'thor-devkit/dist/cry/hdnode'
import { secp256k1 } from 'thor-devkit/dist/cry/secp256k1'
import { encrypt } from './cipher'
import { init as initSalt } from './salt'
import { newVault } from './vault'
import { collectEntropy } from '../worker'

export interface Vault {
    readonly type: Vault.Type

    derive(index: number): Promise<Vault.Node>

    decrypt(password: string): Promise<string | Buffer>
    clone(password: string, newPassword: string): Promise<Vault>

    encode(): string
}

export namespace Vault {
    export type Type = 'hd' | 'sk' | 'usb'

    export interface Node {
        readonly address: string
        readonly index: number
        unlock(password: string): Promise<Buffer>
    }

    export async function generateMnemonic(len = 32) {
        if (len < 12 || len > 32 || len % 4 !== 0) {
            throw new Error('invalid arg')
        }
        const entropy = await collectEntropy()
        return mnemonic.generate(() => {
            const mac = createHmac('sha256', randomBytes(32))
            return mac.update(entropy).digest().slice(0, len)
        })
    }

    export async function decode(data: string): Promise<Vault> {
        const salt = await initSalt()
        const entity = JSON.parse(data)
        return newVault(salt, entity)
    }

    export async function createHD(words: string[], password: string): Promise<Vault> {
        const salt = await initSalt()
        const root = HDNode.fromMnemonic(words)
        const glob = await encrypt(Buffer.from(words.join(' '), 'utf8'), password, salt)
        return newVault(salt, {
            type: 'hd',
            pub: root.publicKey.toString('hex'),
            chainCode: root.chainCode.toString('hex'),
            cipherGlob: glob
        })
    }

    export async function createSK(sk: Buffer, password: string): Promise<Vault> {
        const salt = await initSalt()
        const glob = await encrypt(sk, password, salt)
        return newVault(salt, {
            type: 'sk',
            pub: secp256k1.derivePublicKey(sk).toString('hex'),
            cipherGlob: glob
        })
    }

    export function bindUSB(pub: Buffer, chainCode: Buffer): Promise<Vault> {
        return Promise.resolve(newVault(Buffer.from([]), {
            type: 'usb',
            pub: pub.toString('hex'),
            chainCode: chainCode.toString('hex')
        }))
    }
}
