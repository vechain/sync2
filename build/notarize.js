// eslint-disable-next-line @typescript-eslint/no-var-requires
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context

    if (electronPlatformName !== 'darwin') {
        return
    }

    if (!(process.env.APPLE_API_KEY_ID && process.env.APPLE_API_ISSUER)) {
        console.warn(
            'Skipping macOS app notarization.' +
            ' Missing one or more environment vars (APPLE_API_KEY_ID, APPLE_API_ISSUER).'
        )
        return
    }

    const appName = context.packager.appInfo.productFilename

    return await notarize({
        tool: 'notarytool',
        appPath: `${appOutDir}/${appName}.app`,
        appleApiKey: `~/private_keys/AuthKey_${process.env.APPLE_API_KEY_ID}.p8`,
        appleApiKeyId: process.env.APPLE_API_KEY_ID,
        appleApiIssuer: process.env.APPLE_API_ISSUER
    })
}
