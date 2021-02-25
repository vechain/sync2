import { Menu } from 'electron'
import contextMenu from 'electron-context-menu'

export function setupMenu() {
    if (process.platform === 'darwin') {
        Menu.setApplicationMenu(Menu.buildFromTemplate([
            { role: 'appMenu' },
            { role: 'editMenu' },
            { role: 'viewMenu' },
            { role: 'windowMenu' }
        ]))
    } else {
        Menu.setApplicationMenu(null)
    }
    contextMenu()
}
