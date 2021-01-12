// This is just an example,
// so you can safely delete all default props below

/* eslint-disable @typescript-eslint/camelcase */
export default {
    common: {
        confirm: '确认',
        yes: '是',
        dismiss: '关闭',
        delete: '删除',
        add: '添加',
        cancel: '取消',
        finish: '完成',

        // network
        mainnet: '主网',
        testnet: '测试网',
        private: '私有网络',

        // error_message
        required_field: '该选项必填',
        something_wrong: '出错了',

        // notify
        wallet_updated: '钱包已升级',
        wallet_created: '钱包已创建',

        lang_auto: '自动'
    },
    index: {
        action_new_address: '新建地址',
        action_backup: '备份',
        action_rename: '重命名钱包',
        action_upgrade: '立即升级',
        action_settings: '设置',
        action_activities: '近期活动',
        action_create: '现在创建',
        msg_rename: '钱包名称能帮助您快速区分钱包',
        msg_upgrade: '有新的版本',
        msg_delete: '确定吗? 请确认您已备份该钱包，该行为无法撤销。',
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
        action_language: '语言偏好'
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
        title_feature_2: '钱包管理',
        title_feature_3: '签名服务',
        msg_init_animation_s1: '初始化',
        msg_init_animation_s2: '收集熵生成随机种子',
        msg_init_animation_s3: '生成钱包',
        msg_init_animation_s4: '使用一个密码来加密您的钱包',
        msg_init_animation_s5: '将钱包安全地另存到本地',
        msg_init_complete: '您的钱包已经就绪！',
        msg_feature_1: '崭新的 Sync 钱包设计聚焦于您的使用体验',
        msg_feature_2: '随时随地轻松管理资产',
        msg_feature_3: '签署证书或交易时获得无缝的用户体验'
    }
}
