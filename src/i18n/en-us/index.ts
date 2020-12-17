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
        add: 'Add',
        cancel: 'Cancel',
        finish: 'Finish',

        // network
        mainnet: 'Main Net',
        testnet: 'Test Net',
        private: 'Private',

        // error_message
        required_field: 'This field is required',
        something_wrong: 'Something Wrong',

        // notify
        wallet_updated: 'Wallet Updated',
        wallet_created: 'Wallet Created!'
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
    },
    nodes: {
        title_add_dialog: 'Add Node',
        msg_node_added: 'Node Added',
        msg_node_deleted: 'Node Deleted',
        msg_node_existed: 'Node already exists!',
        msg_delete: 'Are you sure you want to delete the node?'
    },
    wizard: {
        title_welcome: 'Welcome',
        title_init: 'One moment',
        title_feature_2: 'Wallet Management',
        title_feature_3: 'Signing Service',
        msg_init_animation_s1: 'Initializing',
        msg_init_animation_s2: 'Collecting entropy for random seed',
        msg_init_animation_s3: 'Generating your wallet',
        msg_init_animation_s4: 'Encrypting wallet using your password',
        msg_init_animation_s5: 'Saving wallet to a local secure vault',
        msg_init_complete: 'Your wallet is ready!',
        msg_feature_1: 'The brand new Sync enhanced design focuses on your experience',
        msg_feature_2: 'Manage assets with ease, anytime, anywhere.',
        msg_feature_3: 'Seamless user experience to sign transactions or certificates requested by the dapp.'
    }
}
