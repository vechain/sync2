import { RouteConfig } from 'vue-router'
import Main from 'layouts/Main'
import Index from 'pages/Index'
import NewWallet from 'pages/NewWallet'
import Settings from 'pages/Settings'
import TokensSetting from 'pages/TokensSetting.vue'
import Backup from 'pages/Backup'
import Address from 'pages/Address'
import Activities from 'pages/Activities'
import ResetPin from 'pages/ResetPin.vue'
import Asset from 'pages/Asset'
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
            path: 'w/:walletId(\\d+)/:addressIndex(\\d+)',
            name: 'address',
            component: Address
        }, {
            path: 'w/:walletId(\\d+)/:addressIndex(\\d+)/a/:symbol',
            name: 'asset',
            component: Asset
        }, {
            path: 'new-wallet',
            name: 'new-wallet',
            component: NewWallet
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
