import { autoUpdater, UpdateInfo } from 'electron-updater'
import Deferred from '../../src/utils/deferred'

export function newUpdater() {
    let downloadProgress = 0
    let error: { name: string, message: string } | null = null
    let available: UpdateInfo | null = null
    let status: 'none' | 'checking' | 'downloading' | 'downloaded' = 'none'
    let downloaded = new Deferred<UpdateInfo>()

    autoUpdater.on('error', err => {
        error = err
        status = 'none'
        downloadProgress = 0
        available = null
        downloaded = new Deferred<UpdateInfo>()
    })
    autoUpdater.on('checking-for-update', () => {
        status = 'checking'
        error = null
        downloadProgress = 0
    })
    autoUpdater.on('update-available', info => {
        available = info
    })
    autoUpdater.on('update-not-available', () => {
        status = 'none'
    })
    autoUpdater.on('download-progress', info => {
        status = 'downloading'
        downloadProgress = info.percent
    })
    autoUpdater.on('update-downloaded', info => {
        status = 'downloaded'
        downloaded.resolve(info)
    })

    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.autoDownload = true

    return {
        get status() { return status },
        get downloadProgress() { return downloadProgress },
        get error() { return error },
        get available() { return available },
        get downloaded() { return downloaded },

        check() { return autoUpdater.checkForUpdates().then(r => r.updateInfo) },
        quitAndInstall() { autoUpdater.quitAndInstall() }
    }
}
