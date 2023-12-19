// This is just an example,
// so you can safely delete all default props below

/* eslint-disable @typescript-eslint/camelcase */
export default {
    common: {
        ok: '确定',
        confirm: '确认',
        dismiss: '忽略',
        delete: '删除',
        add: '添加',
        cancel: '取消',
        finish: '完成',
        next: '下一步',
        decline: '拒绝',
        copy: '复制',
        copied: '已复制到剪贴板',
        close: '关闭',
        continue: '继续',
        view: '查看',

        // networks
        mainnet: '主网',
        testnet: '测试网',
        private: '私有网络',

        // error_message
        required_field: '该选项必填',
        something_wrong: '出错了',
        no_wallet: '还未创建钱包',
        invalid_input: '无效输入',

        // notify
        wallet_updated: '钱包已更新',
        wallet_created: '钱包已创建',
        wallet_deleted: '钱包已删除',

        lang_auto: '自动',

        transaction: '交易',
        certificate: '证书',
        identification: '身份认证',
        agreement: '协议',
        unknown: '未知',
        sent: '已发送',
        received: '已接收'
    },
    disclaimer: {
        msg_unstable_terms: '注意：您当前使用的是非稳定版本的Sync2，请避免使用此版本管理包含主网资产的钱包。非稳定版本可能存在严重的缺陷或包含未开发完成的功能，并可能带来数据丢失的风险。它的目的是为了让开发者和部分用户提前预览新功能，帮助发现问题，以达到持续改进。',
        label_unstable_terms_accept: '我已知悉，愿意承担风险',

        msg_disclaimer_terms: '免责声明：在正式使用Sync2之前，您应当充分理解去中心化的要义。Sync2不会在除本机之外的任何地方存储您的私钥/助记词/密码等机密信息，您有责任妥善备份上述机密信息，并将它们保存在安全的地方。对于包括但不限于私钥/助记词/密码丢失、遗忘或被窃取所产生的后果，Sync2作者及其所属公司或组织不承担任何责任。',
        label_disclaimer_terms_accept: '我理解，愿意承担一切责任'
    },
    wizard: {
        title_welcome: '欢迎',
        title_init: '稍等片刻',
        title_feature_1: 'VeChain Sync2',
        title_feature_2: '资产管理',
        title_feature_3: '与DApp交互',
        msg_feature_1: '最新的 Sync 提供钱包管理和应用交互',
        msg_feature_2: '发送和接收资产',
        msg_feature_3: '随时随地签署交易或证书',
        msg_init_animation_s1: '准备您的主密钥',
        msg_init_animation_s2: '初始化&加密',
        msg_init_animation_s3: '生成钱包助记词',
        msg_init_animation_s4: '使用主密钥加密钱包',
        msg_init_animation_s5: '妥善地保存已加密的钱包',
        msg_init_complete: '您的钱包已经就绪！',
        action_get_started: '开始使用'
    },
    index: {
        action_new_address: '新建地址',
        action_backup: '备份',
        action_rename: '重命名钱包',
        action_upgrade: '立即升级',
        action_backup_now: '立即备份',
        action_settings: '设置',
        action_activities: '操作记录',
        action_create: '现在创建',
        msg_upgrade: '新版本已经就绪',
        msg_delete: '请输入"ok"继续。请确认此钱包已经备份，该操作无法撤销。',
        msg_backup: '钱包尚未备份！备份钱包以保障资产安全。',
        label_wallets: '钱包'
    },
    newWallet: {
        title: '新建钱包',
        msg_mnemonic_error: '无效的助记词',
        mnemonic_words_count: '助记词数量',
        action_generate: '生成',
        action_import: '导入',
        label_wallet_name: '钱包名称',
        label_mnemonic: '请输入您的助记词',
        label_advance: '高级模式',
        action_custom_path: '自定义',
        action_vet_path: 'Vechain',
        action_eth_path: 'Ethereum',
        label_path: '路径',
        msg_example: '示例',
        msg_invalid_path: '无效助记词路径',
        label_ledger_user: 'Ledger用户？',
        action_ledger_link: '现在绑定'
    },
    authenticationDialog: {
        title: '授权',
        msg_password_error: '密码错误',
        action_unlock: '解锁',
        label_input_password: '输入密码以解锁'
    },
    settings: {
        title: '设置',
        action_change_password: '更改密码',
        action_token_list: '代币管理',
        action_nodes: '节点设置',
        action_language: '语言偏好',
        msg_password_changed: '密码已修改',
        action_user_guide: '用户指南'
    },
    nodes: {
        title_add_dialog: '添加节点',
        msg_node_added: '节点已添加',
        msg_node_deleted: '节点已删除',
        msg_node_existed: '节点已存在',
        msg_delete: '确认删除该节点?'
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
        label_to: '接收人',
        label_amount: '数额',
        label_asset: '资产',
        label_recent_transfer: '近期接收人',
        msg_invalid_amount: '无效数额',
        msg_invalid_address: '请输入有效地址',
        msg_invalid_address_checksum: '地址检验失败',
        action_send: '发送'
    },
    activities: {
        title: '操作记录',
        title_signed_content: '已签内容',
        label_reverted: '失败',
        label_expired: '过期',
        label_sending: '发送中',
        msg_not_found: '无操作记录'
    },
    newPasswordDialog: {
        msg_password_mismatch: '密码不一致',
        msg_password_too_short: '密码过短(至少6位)',
        title_set_new_password: '设置新密码',
        title_confirm_password: '确认您的密码'
    },
    backup: {
        title: '备份',
        action_next_verify: '开始校验',
        label_backed_up: '钱包已备份',
        msg_backed_up: '请将助记词安全地存放，切勿将您的助记词与他人分享',
        msg_confirm_your_mnemonic: '验证您的助记词',
        msg_backup_intro: '助记词包含恢复钱包所需的信息，若您遗失了钱包可通过助记词恢复',
        label_backup_tips: '开始前请仔细阅读',
        msg_backup_tips_1: '请按照顺序抄写',
        msg_backup_tips_2: '请确保存放于安全的地方',
        msg_backup_tips_3: '请勿截图或录制屏幕',
        label_your_mnemonic: '抄写您的助记词',

        // notify
        msg_wallet_not_found: '找不到钱包'
    },
    sign: {
        title: '签名',
        msg_loading_content: '内容加载中...',
        msg_loading_failed: '加载失败',
        msg_request_signature: '请求您的签名',
        label_request_from: '来自 DApp',
        label_request_type: '类型',
        label_request_summary: '概要',
        label_purpose: '用途',
        msg_invalid_request: '无效请求',
        msg_fetch_request_failed: '无法获取请求内容',
        msg_request_hash_mismatch: '注意: 请求内容已损坏或者被篡改',
        msg_fee_delegation: '费用由应用支付',

        // sign success
        title_success: '成功',
        msg_signed: '您已签署 {content_type}',
        action_view_activities: '查看操作记录',

        // sign tx/cert
        label_select_priority: '优先级',
        label_estimate_fee: '预估手续费',
        label_priority_regular: '普通',
        label_priority_medium: '中',
        label_priority_high: '高',
        action_sign: '签名',

        // error occurred
        label_insufficient_vtho: 'VTHO不足',
        msg_insufficient_vtho: 'VTHO余额不足以发送交易',
        label_transaction_warning: '交易可能会失败',
        label_critical_error: '严重错误',
        label_vm_error: '虚拟机错误',
        msg_delegation_failed: '请求代付手续费失败',
        msg_address_not_owned: '未拥有请求的钱包地址',
        msg_vip191_not_supported: '不支持VIP191功能',

        // clause op type
        op_transfer_asset: '转账',
        op_contract_call: '合约调用',
        op_contract_creation: '合约创建',

        title_ask_create_wallet: '尚无可用钱包',
        message_ask_create_wallet: '现在创建吗?'
    },
    ledger: {
        title_connecting: '连接中',
        title_reading_data: '正在读取数据',
        title_checking_status: '正在状态检查',
        title_signing_data: '正在对数据签名',
        // hints
        msg_connecting: '请连接并解锁您的Ledger',
        msg_checking_status: '进入VeChain App',
        msg_signing_data: '请在Ledger上确认',
        // errors
        msg_wrong_device: '错误设备',
        msg_unknown_data: '未知数据类型',
        label_link: '绑定'
    },
    bioAuth: {
        title: '生物识别验证',
        msg_auth_failed: '身份验证失败,请重试'
    }
}
