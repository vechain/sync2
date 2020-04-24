import Worker from 'worker-loader!./handler'

const worker = new Worker()

export function generateKey() {
    return new Promise<Buffer>(resolve => {
        worker.postMessage(['generateKey'])
        worker.onmessage = ev => {
            resolve(Buffer.from(ev.data))
        }
    })
}
