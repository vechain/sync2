import { RouteConfig } from 'vue-router'
import Main from 'layouts/Main'
import Index from 'pages/Index'
import Address from 'pages/Address'
import Asset from 'pages/Asset'
import Backup from 'pages/Backup'
import NewWallet from 'pages/NewWallet'
import Send from 'pages/Send'
import Settings from 'pages/Settings'
import TokensSetting from 'pages/TokensSetting.vue'
import NodesSetting from 'pages/NodesSetting'
import Sign from 'pages/Sign'
import SignSuccess from 'pages/SignSuccess.vue'
import Activities from 'pages/Activities'

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
            path: 'w/:walletId(\\d+)/:addressIndex(\\d+)/:symbol',
            name: 'asset',
            component: Asset
        }, {
            path: 'w/:walletId(\\d+)/backup',
            name: 'backup',
            component: Backup
        }, {
            path: 'new-wallet',
            name: 'new-wallet',
            component: NewWallet
        }, {
            path: 'send',
            name: 'send',
            component: Send
        }, {
            path: 'settings',
            name: 'settings',
            component: Settings
        }, {
            path: 'tokens-setting',
            name: 'tokens-setting',
            component: TokensSetting
        }, {
            path: 'nodes-setting',
            name: 'nodes-setting',
            component: NodesSetting
        }, {
            // this entry is to handle external signing request in SPA mode only
            path: 'sign',
            name: 'sign',
            component: Sign
        }, {
            path: 'sign-success',
            name: 'sign-success',
            component: SignSuccess
        }, {
            path: 'activities',
            name: 'activities',
            component: Activities
        }]
    }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
    routes.push({
        path: '*',
        redirect: '/'
    })
}

export default routes
