
declare interface Fingerprint {
    isAvailable(
        onSuccess: (result: 'face' | 'finger' | 'biometric') => void,
        onError: (err: Error) => void,
        opts?: { allowBackup: boolean })
    show(
        options: {
            // Title in authentication dialogue. Default: "<APP_NAME> Biometric Sign On"
            title?: string
            // Subtitle in authentication dialogue. Default: null
            subtitle?: string
            // Description in authentication dialogue.Defaults:
            // iOS: "Authenticate"(iOS' evaluatePolicy() requires this field)
            // Android: null
            description?: string
            // Title of fallback button.Defaults:
            // When disableBackup is true
            // "Cancel"
            // When disableBackup is false
            // iOS: "Use PIN"
            // Android: "Use Backup"(Because backup could be anything pin / pattern / password..haven't figured out a reliable way to determine lock type yet source)
            fallbackButtonTitle?: string
            // If true remove backup option on authentication dialogue.Default: false.This is useful if you want to implement your own fallback.
            disableBackup?: boolean
            // For cancel button on Android
            cancelButtonTitle?: string
            // (Android): If false user confirmation is NOT required after a biometric has been authenticated.Default: true.See docs.
            confirmationRequired?: boolean
        },
        onSuccess: () => void,
        onError: (err: Error) => void)

    registerBiometricSecret(
        options: {
            // String secret to encrypt and save, use simple strings matching the regex[a - zA - Z0 - 9 -] +
            secret: string
            // Title in authentication dialogue. Default: "<APP_NAME> Biometric Sign On"
            title?: string
            // Subtitle in authentication dialogue. Default: null
            subtitle?: string
            // Description in authentication dialogue. Defaults:
            // iOS: "Authenticate" (iOS' evaluatePolicy() requires this field)
            // Android: null
            description?: string
            // Title of fallback button. Defaults:
            // When disableBackup is true
            // "Cancel"
            // When disableBackup is false
            // iOS: "Use PIN"
            // Android: "Use Backup" (Because backup could be anything pin/pattern/password..haven't figured out a reliable way to determine lock type yet source)
            fallbackButtonTitle?: string
            // If true remove backup option on authentication dialogue.Default: false.This is useful if you want to implement your own fallback.NOTE: it will be disabled on Android
            disableBackup?: boolean
            // For cancel button on Android
            // confirmationRequired(Android): If false user confirmation is NOT required after a biometric has been authenticated.Default: true.See docs.
            cancelButtonTitle?: string
            // If true secret will be deleted when biometry items are deleted or enrolled
            invalidateOnEnrollment?: boolean
        },
        onSuccess: () => void,
        onError: (err: Error) => void)

    loadBiometricSecret(
        options: {
            // Title in authentication dialogue. Default: "<APP_NAME> Biometric Sign On"
            title?: string
            // Subtitle in authentication dialogue. Default: null
            subtitle?: string
            // Description in authentication dialogue. Defaults:
            // iOS: "Authenticate" (iOS' evaluatePolicy() requires this field)
            // Android: null
            description?: string
            // Title of fallback button. Defaults:
            // When disableBackup is true
            // "Cancel"
            // When disableBackup is false
            // iOS: "Use PIN"
            // Android: "Use Backup" (Because backup could be anything pin/pattern/password ..haven't figured out a reliable way to determine lock type yet source)
            fallbackButtonTitle?: string
            // If true remove backup option on authentication dialogue. Default: false. This is useful if you want to implement your own fallback. NOTE: it will be disabled on Android
            disableBackup?: boolean
            // For cancel button on Android
            cancelButtonTitle?: string
            // (Android): If false user confirmation is NOT required after a biometric has been authenticated . Default: true. See docs.
            confirmationRequired?: boolean
        },
        onSuccess: (secret: string) => void,
        onError: (err: Error) => void)
}
