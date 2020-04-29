/**
 * listen external url used to start this app.
 * @returns the url
 */
export async function listen(): Promise<string> {
    if (process.env.MODE === 'electron') {
        return require('electron').remote.app.listenOpenUrl()
    } else if (process.env.MODE === 'cordova') {
        return new Promise(resolve => {
            window.handleOpenURL = url => {
                window.handleOpenURL = undefined
                resolve(url)
            }
        })
    } else {
        // not work in spa mode. watch router event instead.
        return new Promise(() => { }) // never resolve
    }
}
