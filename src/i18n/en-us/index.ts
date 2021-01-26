// This is just an example,
// so you can safely delete all default props below

/* eslint-disable @typescript-eslint/camelcase */
export default {
    common: {
        ok: 'OK',
        confirm: 'Confirm',
        dismiss: 'Dismiss',
        delete: 'Delete',
        add: 'Add',
        cancel: 'Cancel',
        finish: 'Finish',
        next: 'Next',
        decline: 'Decline',
        copy: 'Copy',
        copied: 'Copied to clipboard',
        close: 'Close',
        continue: 'Continue',
        view: 'View',

        // networks
        mainnet: 'Main Net',
        testnet: 'Test Net',
        private: 'Private',

        // error_message
        required_field: 'This field is required',
        something_wrong: 'Something is wrong',
        no_wallet: 'No wallet created yet',
        invalid_input: 'Invalid input',

        // notify
        wallet_updated: 'Wallet updated',
        wallet_created: 'Wallet created',
        wallet_deleted: 'Wallet deleted',

        lang_auto: 'Automatic',

        transaction: 'Transaction',
        certificate: 'Certificate',
        identification: 'Identification',
        agreement: 'Agreement',
        unknown: 'Unknown',
        sent: 'Sent',
        received: 'Received'
    },
    disclaimer: {
        title_dist_tag: 'UNSTABLE version intended for development usage ONLY',
        msg_dist_tag: 'I understand and still want to try',
        title_terms: 'Please manage your wallet carefully. If you accidentally lose access, we will not be able to recover it for you.',
        msg_terms: 'I understand and accept the risk'
    },
    wizard: {
        title_welcome: 'Welcome',
        title_init: 'One Moment',
        title_feature_1: 'VeChain Sync2',
        title_feature_2: 'Asset Management',
        title_feature_3: 'DApps Interaction',
        msg_feature_1: 'The latest Sync provides access to wallets and interactions with dApps.',
        msg_feature_2: 'Send and receive assets in one place.',
        msg_feature_3: 'Sign transactions and certificates anytime, anywhere.',
        msg_init_animation_s1: 'Preparing your master key',
        msg_init_animation_s2: 'Initializing & encrypting',
        msg_init_animation_s3: 'Generating mnemonic words of wallet',
        msg_init_animation_s4: 'Encrypting wallet using the master key',
        msg_init_animation_s5: 'Saving encrypted wallet to local vault',
        msg_init_complete: 'Your wallet is ready!',
        action_get_started: 'Get Started'
    },
    index: {
        action_new_address: 'New Address',
        action_backup: 'Backup',
        action_rename: 'Rename Wallet',
        action_upgrade: 'Upgrade Now',
        action_backup_now: 'Backup Now',
        action_settings: 'Settings',
        action_activities: 'Activities',
        action_create: 'Create Now',
        msg_upgrade: 'New version is ready :)',
        // request user to enter "ok" to confirm
        msg_delete: 'Please enter "ok" to delete wallet. This cannot be undone. Unless you have backed up your wallet beforehand.',
        msg_backup: 'Wallet not backed up! Backup your wallet keep your assets safe.',
        label_wallets: 'Wallets'
    },
    newWallet: {
        title: 'New Wallet',
        msg_mnemonic_error: 'Invalid mnemonic words',
        mnemonic_words_count: 'Mnemonic words count',
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
        msg_password_changed: 'Password changed'
    },
    nodes: {
        title_add_dialog: 'Add Node',
        msg_node_added: 'Node added',
        msg_node_deleted: 'Node deleted',
        msg_node_existed: 'Node already exists',
        msg_delete: 'Are you sure you want to delete the node?'
    },
    address: {
        title: 'Address',
        label_assets: 'Assets',
        action_receive: 'Receive'
    },
    asset: {
        title: 'Asset',
        label_history: 'History',
        msg_no_history: 'No transfer history',
        msg_no_more: '- The End - '
    },
    send: {
        title: 'Send',
        label_to: 'Recipient',
        label_amount: 'Amount',
        label_asset: 'Asset',
        label_recent_transfer: 'Recent Recipients',
        msg_invalid_amount: 'Invalid amount',
        msg_invalid_address: 'Please enter a valid address',
        msg_invalid_address_checksum: 'Address checksum failed',
        action_send: 'Send'
    },
    activities: {
        title: 'Activities',
        title_signed_content: 'Signed Content',
        label_reverted: 'Reverted',
        label_expired: 'Expired',
        label_sending: 'Sending',
        msg_not_found: 'No activities'
    },
    newPasswordDialog: {
        msg_password_mismatch: 'Password mismatch',
        msg_password_too_short: 'Password too short (at least 6 characters)',
        title_set_new_password: 'Set New Password',
        title_confirm_password: 'Confirm Your Password'
    },
    backup: {
        title: 'Backup',
        action_next_verify: 'Let’s Verify',
        label_backed_up: 'Wallet Backed Up',
        msg_backed_up: 'Never share your mnemonic words with anyone,store it securely!',
        msg_confirm_your_mnemonic: 'Verify Your Mnemonic Words',
        msg_backup_intro: 'The mnemonic words stores all the information that is needed at any point in time to recover your wallet',
        label_backup_tips: 'Read Before Backup',
        msg_backup_tips_1: 'Write it down in given order',
        msg_backup_tips_2: 'Keep it in a secure place',
        msg_backup_tips_3: 'No screenshot or screen recording',
        label_your_mnemonic: 'Write Down Your Mnemonic Words'
    },
    sign: {
        title: 'Sign',
        msg_loading_content: 'Loading signing content ...',
        msg_loading_failed: 'Failed to load content',
        msg_request_signature: 'Your signature is being requested',
        label_request_from: 'From DApp',
        label_request_type: 'Type',
        label_request_summary: 'Summary',
        label_purpose: 'Purpose',
        msg_invalid_request: 'Invalid request',
        msg_fetch_request_failed: 'Unable to fetch request content',
        msg_request_hash_mismatch: 'CAUTION: the request content is corrupted or tampered',

        // sign success
        title_success: 'Success',
        msg_signed: 'You’ve signed the {content_type}',
        action_view_activities: 'View Activities',

        // sign tx/cert
        label_select_priority: 'Priority',
        label_estimate_fee: 'Est. Fee',
        label_priority_regular: 'Regular',
        label_priority_medium: 'Medium',
        label_priority_high: 'High',
        action_sign: 'Sign',

        // error occurred
        label_insufficient_vtho: 'Insufficient VTHO',
        msg_insufficient_vtho: 'Not enough VTHO to send transaction',
        label_transaction_warning: 'Transaction may fail/revert',
        label_critical_error: 'Critical Error',
        label_vm_error: 'VM Error',
        msg_delegation_failed: 'Failed to request transaction fee delegation',
        msg_address_not_owned: 'Requested address not owned',
        msg_vip191_not_supported: 'VIP191 feature is not supported',

        // clause op type
        op_transfer_asset: 'Transfer',
        op_contract_call: 'Contract Call',
        op_contract_creation: 'Contract Creation',

        title_ask_create_wallet: 'No wallet',
        message_ask_create_wallet: 'Create now?'
    }
}
