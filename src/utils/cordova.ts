// cordova only functions

export const deviceReady = new Promise(resolve => {
    document.addEventListener('deviceready', () => resolve(), false)
})
