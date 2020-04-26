import Worker from 'worker-loader!./handler'

const worker = new Worker()

function call<R>(cmd: string, ...args: unknown[]): Promise<R> {
    return new Promise<R>((resolve, reject) => {
        worker.postMessage([cmd, args])
        worker.onmessage = ev => {
            const [result, err] = ev.data
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        }
    })
}

export function collectEntropy() {
    return call<Int16Array>('collectEntropy')
}

export function deriveAddress(pub: Buffer, chainCode: Buffer, index: number) {
    return call<string>('deriveAddress', pub, chainCode, index)
}

export function derivePrivateKey(words: string[], index: number) {
    return call<Uint8Array>('derivePrivateKey', words, index)
        .then(k => Buffer.from(k))
}

export function kdf(password: string, salt: Buffer, n: number) {
    return call<Uint8Array>('kdf', password, salt, n)
        .then(k => Buffer.from(k))
}
