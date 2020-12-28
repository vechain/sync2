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
        next: 'Next',
        copy: 'Copy',
        copied: 'Copied to clipboard',
        default: 'Default',

        // network
        mainnet: 'Main Net',
        testnet: 'Test Net',
        private: 'Private',

        // error_message
        required_field: 'This field is required',
        something_wrong: 'Something is Wrong',
        error_occurred: 'Error Occurred',

        // notify
        wallet_updated: 'Wallet Updated',
        wallet_created: 'Wallet Created!',

        lang_auto: 'Automatic',

        transferring: 'Transferring'
    },
    index: {
        action_new_address: 'New Address',
        action_backup: 'Backup',
        action_rename: 'Rename Wallet',
        action_upgrade: 'Upgrade Now',
        action_backup_now: 'Back Up Now',
        action_settings: 'Settings',
        action_activities: 'Activities',
        action_create: 'Create Now',
        msg_rename: 'Wallet name helps you quickly identify the wallet.',
        msg_upgrade: 'New version is ready :)',
        msg_delete: 'Are you sure? This cannot be undone. Unless you have backed up your wallet beforehand.',
        msg_backup: 'Wallet not backed up! Backup your wallet keep your assets safe.',
        label_wallets: 'Wallets',
        label_no_wallet: 'No wallet created yet'
    },
    newWallet: {
        title: 'New Wallet',
        title_desc: 'Sync Wallet',
        msg_desc: 'Manage assets with ease, anytime, anywhere',
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
        action_language: 'Language',
        msg_password_changed: 'Password Changed'
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
        title_init: 'One Moment',
        title_feature_1: 'VeChain Sync2',
        title_feature_2: 'Wallet Management',
        title_feature_3: 'Signing Service',
        msg_init_animation_s1: 'Initializing',
        msg_init_animation_s2: 'Collecting entropy for random seed',
        msg_init_animation_s3: 'Generating your wallet',
        msg_init_animation_s4: 'Encrypting wallet using your password',
        msg_init_animation_s5: 'Saving wallet to a local secure vault',
        msg_init_complete: 'Your wallet is ready!',
        msg_feature_1: 'The brand new Sync enhanced design focuses on your experience.',
        msg_feature_2: 'Manage assets with ease, anytime, anywhere.',
        msg_feature_3: 'Seamless user experience to sign transactions or certificates requested by the dapp.',
        action_get_started: 'Get Started'
    },
    address: {
        title: 'Address',
        label_assets: 'Assets',
        action_receive: 'Receive'
    },
    asset: {
        label_transfer: 'Transfers',
        msg_not_found: 'No transfer found',
        msg_no_more: 'No more transfers',
        action_transfer: 'Transfer',
        msg_receive: 'Share your address to receive assets'
    },
    send: {
        title: 'Transfer',
        label_to: 'To',
        label_amount: 'Amount',
        label_balance: 'Balance:',
        label_recent_transfer: 'Recent Transfers',
        msg_error_invalid_balance: 'Invalid Amount',
        msg_invalid_address: 'Please enter a valid address',
        msg_checksum_failed: 'Checksum Failed',
        action_proceed: 'Proceed'
    },
    activities: {
        title: 'Activities',
        title_signed_content: 'Signed Content',
        label_reverted: 'Reverted',
        label_expired: 'Expired',
        label_sending: 'Sending',
        label_confirming: 'Confirming',
        action_view_on_explorer: 'View on Explorer',
        action_copy_txId: 'Copy TxID',
        action_view_signed_content: 'View Signed Content',
        action_copy_dapp_url: 'Copy DApp URL',
        msg_not_found: 'No Activities Found',
        msg_activities_desc: 'Activities that you’ve interacted with recently will appear here.'
    },
    newPasswordDialog: {
        msg_password_mismatch: 'Password mismatch',
        msg_password_too_short: 'Password too short (at least 6 characters)',
        title_set_new_password: 'Set New Password',
        title_confirm_password: 'Confirm Your Password'
    },
    backup: {
        title: 'Backup',
        action_next_verify: 'I’ve written down',
        label_backed_up: 'Wallet Backed Up',
        msg_backed_up: 'Never share your mnemonic words with anyone,store it securely!',
        msg_confirm_your_mnemonic: 'Confirm Your Mnemonic Words',
        msg_backup_intro: 'The mnemonic words stores all the information that is needed at any point in time to recover your wallet',
        label_backup_tips: 'Read Before Backup',
        msg_backup_tips_1: 'Write it down in given order',
        msg_backup_tips_2: 'Keep it in a secure place',
        msg_backup_tips_3: 'No screenshot or screen recording',
        label_your_mnemonic: 'Your Mnemonic Words'
    }
}
