// This is just an example,
// so you can safely delete all default props below

/* eslint-disable @typescript-eslint/camelcase */
export default {
    common: {
        confirm: '确认',
        yes: '是',
        dismiss: '忽略',
        delete: '删除',
        add: '添加',
        cancel: '取消',
        finish: '完成',
        next: '下一步',
        decline: '拒绝',
        copy: '复制',
        copied: '复制到剪切板',
        close: '关闭',
        continue: '继续',
        view: '查看',

        // network
        mainnet: '主网',
        testnet: '测试网',
        private: '私有网络',

        // error_message
        required_field: '该选项必填',
        something_wrong: '出错了',
        error_occurred: '发生错误',
        no_wallet: '钱包未创建',
        invalid_input: '无效输入',

        // notify
        wallet_updated: '钱包已更新',
        wallet_created: '钱包已创建',
        wallet_deleted: '钱包已删除',

        lang_auto: '自动',

        transaction: '交易',
        transfer_asset: '转账',
        contract_call: '合约交互',
        contract_creation: '创建合约',
        new_contract: '新合约',
        certificate: '证书',
        identification: '身份信息',
        agreement: '协议',
        unknown: '未知',
        none: '无',
        sent: '已发送',
        received: '已接收'
    },
    index: {
        action_new_address: '新建地址',
        action_backup: '备份',
        action_rename: '重命名钱包',
        action_upgrade: '立即升级',
        action_backup_now: '立即备份',
        action_settings: '设置',
        action_activities: '近期活动',
        action_create: '现在创建',
        msg_upgrade: '有新的版本',
        msg_delete: '请输入"ok"繼續。请确认您已备份该钱包，该行为无法撤销。',
        msg_backup: '备份能让您即使丢失设备也能恢复钱包',
        label_wallets: '钱包'
    },
    newWallet: {
        title: '新建钱包',
        msg_mnemonic_error: '助记词校验不通过',
        mnemonic_words_count: '助记词数量',
        action_generate: '生成',
        action_import: '导入',
        label_wallet_name: '钱包名称',
        label_mnemonic: '请输入您的助记词'
    },
    authenticationDialog: {
        title: '授权',
        msg_password_error: '密码错误',
        action_faceID: '使用 FaceID 解锁',
        action_unlock: '解锁',
        label_input_password: '输入密码以解锁'
    },
    settings: {
        title: '设置',
        action_change_password: '更改密码',
        action_bio_auth: '生物识别解锁',
        action_token_list: '代币管理',
        action_nodes: '节点连接',
        action_language: '语言偏好',
        msg_password_changed: '密码修改成功'
    },
    nodes: {
        title_add_dialog: '添加节点',
        msg_node_added: '节点已添加',
        msg_node_deleted: '节点已删除',
        msg_node_existed: '节点已存在！',
        msg_delete: '确认删除该节点?'
    },
    wizard: {
        title_welcome: '欢迎',
        title_init: '稍等片刻',
        title_feature_1: '唯链 Sync2',
        title_feature_2: '资产管理',
        title_feature_3: 'DApp交互',
        msg_feature_1: '最新的 Sync 提供钱包管理和应用交互',
        msg_feature_2: '在应用中发送和接收资产',
        msg_feature_3: '随时随地签署交易或证书',
        msg_init_animation_s1: '准备您的主密钥',
        msg_init_animation_s2: '初始化&加密',
        msg_init_animation_s3: '生成钱包助记词',
        msg_init_animation_s4: '使用主密钥加密钱包',
        msg_init_animation_s5: '将已加密的钱包安全地另存到本地',
        msg_init_complete: '您的钱包已经就绪！',
        action_get_started: '开始使用'
    },
    address: {
        title: '地址',
        label_assets: '资产',
        action_receive: '接收'
    },
    asset: {
        title: '资产',
        label_history: '转账记录',
        msg_no_history: '无记录',
        msg_no_more: '- 完 - '
    },
    send: {
        title: '发送',
        label_to: '收款人',
        label_amount: '数量',
        label_asset: '资产',
        label_recent_transfer: '近期收款人',
        msg_recipient_placeholder: '0x开头',
        msg_error_invalid_balance: '无效数量',
        msg_invalid_address: '请输入有效地址',
        msg_checksum_failed: '检验失败',
        action_proceed: '继续'
    },
    activities: {
        title: '活动',
        title_signed_content: '已签内容',
        label_reverted: '失败',
        label_expired: '过期',
        label_sending: '发送中',
        msg_not_found: '无活动',
        msg_activities_desc: '近期活动在此显示',
        msg_contract_creation: '创建合约',
        msg_vet_transfer: 'VET 转账',
        msg_contract_call: '合约交互',
        msg_multi_clauses: '多子句合约交互',
        msg_empty_clause: '空'
    },
    newPasswordDialog: {
        msg_password_mismatch: '密码不一致',
        msg_password_too_short: '密码过短(至少6位)',
        title_set_new_password: '设置新密码',
        title_confirm_password: '确认您的密码'
    },
    backup: {
        title: '备份',
        action_next_verify: '开始验证',
        label_backed_up: '钱包已备份',
        msg_backed_up: '请将助记词安全地存放，切勿将您的助记词与他人分享',
        msg_confirm_your_mnemonic: '验证您的助记词',
        msg_backup_intro: '助记词包含恢复钱包所需的信息，若您遗失了钱包可通过助记词恢复',
        label_backup_tips: '开始前请仔细阅读',
        msg_backup_tips_1: '请按照顺序抄写',
        msg_backup_tips_2: '请确保存放于安全的地方',
        msg_backup_tips_3: '请勿截图或录制屏幕',
        label_your_mnemonic: '抄写您的助记词'
    },
    sign: {
        title: '签名',
        msg_loading_content: '内容加载中...',
        msg_loading_failed: '加载失败',
        msg_request_signature: '请求您的签名',
        label_request_from: '来自 DApp',
        label_request_type: '类型',
        label_request_summary: '概要',
        label_identification_purpose: '身份信息签署',
        label_agreement_purpose: '协议签署',
        label_unknown_purpose: '未知',
        msg_invalid_request: '无效请求',
        msg_retrieve_failed: '未找到请求内容',
        msg_content_hash_mismatch: '注意:请求内容不一致',

        // sign success
        title_success: '成功',
        msg_signed: '您已签署',
        action_view_activities: '查看活动',

        // sign tx/cert
        label_select_priority: '优先级',
        label_estimate_fee: '预估手续费',
        label_priority_regular: '低',
        label_priority_medium: '中',
        label_priority_high: '高',
        action_sign: '签名',
        label_insufficient_energy: '手续费不足',
        msg_insufficient_energy: 'VTHO不足以发送交易',
        label_transaction_warning: '交易可能会失败',
        label_critical_error: '严重错误',
        label_vm_error: 'VM 错误',
        msg_delegation_failed: '请求代付手续费失败',
        msg_address_not_owned: '未拥有请求的钱包地址',
        msg_vip191_not_supported: '不支持VIP191功能'
    }
}
