
declare interface Vault {
    readonly type: Vault.Type

    node(index: number): Vault.Node

    decrypt(password: string): Promise<string | Buffer>
    clone(password: string, newPassword: string): Promise<Vault>

    encode(): string
}

declare namespace Vault {
    export type Type = 'hd' | 'sk' | 'usb'

    export interface Node {
        readonly address: string
        readonly index: number
        sign(msg: Buffer | string, password: string): Promise<Buffer>
    }
}
