declare module 'worker-loader!*' {
    class WebpackWorker extends Worker {
        constructor()
    }
    export default WebpackWorker
}

declare module '!!file-loader!*' {
    const path : string
    export default path
}
