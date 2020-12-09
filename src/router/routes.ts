import { RouteConfig } from 'vue-router'
import Main from 'layouts/Main.vue'
import Index from 'pages/Index'
import Settings from 'pages/Settings.vue'
import TokensSetting from 'pages/TokensSetting.vue'
import Backup from 'pages/Backup'
import Account from 'pages/Account'
import Activities from 'pages/Activities'
import ResetPin from 'pages/ResetPin.vue'
import AccountTransferLogs from 'pages/AccountTransferLogs'
import Send from 'pages/Send'
import Sign from 'pages/Sign'
import SignSuccess from 'pages/SignSuccess.vue'
import NodesSetting from 'src/pages/NodesSetting'

const routes: RouteConfig[] = [
    {
        path: '/',
        component: Main,
        children: [{
            path: '',
            name: 'index',
            component: Index
        }, {
            path: 'settings',
            name: 'settings',
            component: Settings
        }, {
            path: 'tokens-setting',
            name: 'tokens-setting',
            component: TokensSetting
        }, {
            path: 'backup',
            name: 'backup',
            component: Backup
        }, {
            path: 'account',
            name: 'account',
            component: Account
        }, {
            // this entry is to handle external signing request in SPA mode only
            path: 'sign',
            name: 'sign',
            component: Sign
        }, {
            path: 'activities',
            name: 'activities',
            component: Activities
        }, {
            path: 'reset-pin-code',
            name: 'reset-pin-code',
            component: ResetPin
        }, {
            path: 'account-transfer-logs',
            name: 'account-transfer-logs',
            component: AccountTransferLogs
        }, {
            path: 'send',
            name: 'send',
            component: Send
        }, {
            path: 'sign-success',
            name: 'sign-success',
            component: SignSuccess
        }, {
            path: 'nodes-setting',
            name: 'nodes-setting',
            component: NodesSetting
        }]
    }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
    routes.push({
        path: '*',
        component: () => import('pages/Error404.vue')
    })
}

export default routes
