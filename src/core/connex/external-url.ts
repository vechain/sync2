let cordovaListenOpenUrl: (() => Promise<string>)

if (process.env.MODE === 'cordova') {
    // have to setup handler in global scope for cold start up case
    let pending = ''
    let resolver: ((url: string) => void) | undefined
    window.handleOpenURL = url => {
        if (resolver) {
            resolver(url)
            resolver = undefined
        } else {
            pending = url
        }
    }
    cordovaListenOpenUrl = () => {
        return new Promise(resolve => {
            if (pending) {
                resolve(pending)
                pending = ''
            } else {
                resolver = resolve
            }
        })
    }
}

/**
 * listen external url used to start this app.
 * @returns the url
 */
export async function listen(): Promise<string> {
    if (process.env.MODE === 'electron') {
        const remote = require('electron').remote
        return remote.app.listenOpenUrl(remote.getCurrentWebContents().id)
    } else if (process.env.MODE === 'cordova') {
        return cordovaListenOpenUrl()
    } else {
        // not work in spa mode. watch router event instead.
        return new Promise(() => { }) // never resolve
    }
}
