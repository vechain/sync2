// This is just an example,
// so you can safely delete all default props below

/* eslint-disable @typescript-eslint/camelcase */
export default {
    common: {
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        dismiss: 'Dismiss',
        delete: 'Delete',

        // network
        mainnet: 'Main Net',
        testnet: 'Test Net',
        private: 'Private',

        // error_message
        required_field: 'This field is required',

        // notify
        wallet_updated: 'Wallet Updated',
        wallet_created: 'Wallet created successfully'
    },
    index: {
        action_new_account: 'New Account',
        action_backup: 'Backup',
        action_rename: 'Rename Wallet',
        action_upgrade: 'Upgrade Now',
        action_settings: 'Settings',
        action_activities: 'Activities',
        action_create: 'Create Now',
        msg_rename: 'Wallet name helps you quickly identify the wallet.',
        msg_upgrade: 'New version is ready :)',
        msg_delete: 'Are you sure? this cannot be undone. Unless you have backed up your wallet beforehand.',
        msg_backup: 'Backup allows you to regain wallet access if you lose the device.',
        label_wallets: 'Wallets'
    },
    newWallet: {
        title: 'New Wallet',
        title_desc: 'Sync Wallet',
        msg_desc: 'Manage assets with ease, anytime,anywhere',
        msg_mnemonic_error: 'Invalid mnemonic words',
        msg_mnemonic_words: 'words mnemonic',
        action_generate: 'Generate',
        action_import: 'Import',
        label_wallet_name: 'Wallet Name',
        label_mnemonic: 'Please enter your mnemonic words'
    },
    authenticationDialog: {
        title: 'Authenticate',
        msg_password_error: 'Incorrect password',
        action_faceID: 'Unlock with FaceID',
        action_unlock: 'Unlock',
        label_input_password: 'Enter password to unlock'
    },
    settings: {
        title: 'Settings',
        action_change_password: 'Password',
        action_bio_auth: 'Biometric Authentication',
        action_token_list: 'Tokens',
        action_nodes: 'Nodes',
        action_language: 'Language'
    }
}
