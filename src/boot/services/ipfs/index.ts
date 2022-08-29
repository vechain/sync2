import { create } from 'ipfs-http-client'

export function build() {
    return {
        async uploadFileToIpfs(fileInBase64: string) {
            const client = create({ protocol: 'https', host: 'ipfs.infura.io', port: 5001, apiPath: '/api/v0' })
            const cid = await client.add(fileInBase64)
            const url = `https://ipfs.infura.io/ipfs/${cid.path}`
            return { url, cid }
        },

        async getInfoFromIPFS(ipfsPath: string) {
            const responseProxy = await fetch(ipfsPath)
            const response = await fetch(responseProxy.url)

            const reader = response.body?.getReader()
            let receivedLength = 0
            const chunks = []
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }
                    if (value) {
                        chunks.push(value)
                        receivedLength += value?.length
                    }
                }
            }

            const chunksAll = new Uint8Array(receivedLength)
            let position = 0
            for (const chunk of chunks) {
                chunksAll.set(chunk, position)
                position += chunk.length
            }
            const base64String = new TextDecoder('utf-8').decode(chunksAll)
            return base64String
        }
    }
}
