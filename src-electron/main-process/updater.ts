import { autoUpdater, UpdateInfo } from 'electron-updater'
import { Deferred } from '../../src/utils/deferred'

export function newUpdater() {
    let downloadProgress = 0
    let error: { name: string, message: string } | null = null
    const newVersion = new Deferred<UpdateInfo>()
    let status: 'idle' | 'checking' | 'downloading' | 'downloaded' = 'idle'

    autoUpdater.on('error', err => {
        error = err
        status = 'idle'
        downloadProgress = 0
    })
    autoUpdater.on('checking-for-update', () => {
        status = 'checking'
        error = null
        downloadProgress = 0
    })
    autoUpdater.on('update-available', info => {
        newVersion.resolve(info)
    })
    autoUpdater.on('update-not-available', () => {
        status = 'idle'
    })
    autoUpdater.on('download-progress', info => {
        status = 'downloading'
        downloadProgress = info.percent
    })
    autoUpdater.on('update-downloaded', () => {
        status = 'downloaded'
    })

    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.autoDownload = true

    return {
        get downloadProgress() { return downloadProgress },
        get error() { return error },
        get newVersion() { return newVersion },
        get status() { return status },

        check() { return autoUpdater.checkForUpdates().then(r => r.updateInfo) },
        quitAndInstall() { autoUpdater.quitAndInstall() }
    }
}
