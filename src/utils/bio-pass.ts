import { deviceReady } from './cordova'

/** it provides biometric password saving service */
export interface BioPass {
    /** type of biometric authentication */
    readonly authType: 'face' | 'finger'

    /** save the secret */
    save(title: string, cancelButtonTitle: string, secret: string): Promise<void>

    /** recall the saved secret */
    recall(title: string, cancelButtonTitle: string): Promise<string>
}

export namespace BioPass {
    export async function open(): Promise<BioPass | null> {
        if (process.env.MODE === 'cordova') {
            await deviceReady

            const fp = window.Fingerprint

            let type: 'face' | 'finger' | 'biometric'

            try {
                type = await new Promise((resolve, reject) => {
                    fp.isAvailable(resolve, reject)
                })
            } catch {
                return null
            }

            return {
                get authType() { return type === 'face' ? 'face' : 'finger' },
                save: (title, cancelButtonTitle, secret) => {
                    return new Promise((resolve, reject) => {
                        fp.registerBiometricSecret({
                            title,
                            cancelButtonTitle,
                            secret,
                            disableBackup: true
                        }, resolve, reject)
                    })
                },
                recall: (title, cancelButtonTitle) => {
                    return new Promise<string>((resolve, reject) => {
                        fp.loadBiometricSecret({
                            title,
                            cancelButtonTitle,
                            disableBackup: true
                        }, resolve, reject)
                    })
                }
            }
        }
        return null
    }
}
