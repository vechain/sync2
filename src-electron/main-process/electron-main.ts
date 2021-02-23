import {
    app,
    BrowserWindow,
    nativeTheme,
    webContents,
    dialog
} from 'electron'
import { setupMenu } from './menu'
import { newUpdater } from './updater'

app.allowRendererProcessReuse = false

declare const QUASAR_NODE_INTEGRATION: boolean

let mainWindow: BrowserWindow | null

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        minWidth: 320,
        maxWidth: 800,
        minHeight: 520,
        maxHeight: 1000,
        width: 360,
        height: 640,
        useContentSize: true,
        webPreferences: {
            // Change from /quasar.conf.js > electron > nodeIntegration;
            // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
            // eslint-disable-next-line no-undef
            nodeIntegration: QUASAR_NODE_INTEGRATION,
            nodeIntegrationInWorker: true

            // More info: /quasar-cli/developing-electron-apps/electron-preload-script
            // preload: path.resolve(__dirname, 'electron-preload.js')
        }
    })

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mainWindow.loadURL(process.env.APP_URL!)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

function setupOpenUrlEmitter(): (url: string) => void {
    // works for cold/hot start up
    let pendingUrl = ''
    let resolver: [number, (url: string) => void] | undefined

    app.listenOpenUrl = webContentId => {
        return new Promise(resolve => {
            if (pendingUrl) {
                resolve(pendingUrl)
                pendingUrl = ''
            } else {
                resolver = [webContentId, resolve]
            }
        })
    }
    return (url) => {
        if (resolver && webContents.fromId(resolver[0])) {
            resolver[1](url)
            resolver = undefined
        } else {
            pendingUrl = url
        }
    }
}

(async () => {
    if (process.env.PROD) {
        if (!app.requestSingleInstanceLock()) {
            app.quit()
            return
        }

        app.setAsDefaultProtocolClient('connex')
    }

    try {
        if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
            require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
        }
    } catch (_) { }

    /**
     * Set `__statics` path to static files in production;
     * The reason we are setting it here is that the path needs to be evaluated at runtime
     */
    if (process.env.PROD) {
        global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
    }

    app.updater = newUpdater()
    const emit = setupOpenUrlEmitter()
    app.on('open-url', (ev, url) => {
        emit(url)
        if (mainWindow === null) {
            createWindow()
        }
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow()
        }
    })

    await app.whenReady()

    setupMenu()
    if (process.env.PROD && process.platform === 'darwin') {
        if (!app.isInApplicationsFolder()) {
            if (dialog.showMessageBoxSync({
                message: `${app.name} is not in Application folder, move there?`,
                type: 'question',
                buttons: ['OK', 'Cancel']
            }) === 0) {
                try {
                    app.moveToApplicationsFolder()
                    return
                } catch { }
            }
        }
    }

    createWindow()

    if (process.env.PROD) {
        app.updater.check()
        setInterval(() => {
            app.updater.check()
        }, 24 * 3600 * 1000)
    }
})()
