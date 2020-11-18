import Vue from 'vue'
import { RouteConfig, Route, NavigationGuardNext } from 'vue-router'
import Main from 'layouts/Main.vue'
import Index from 'pages/Index.vue'
import Settings from 'pages/Settings.vue'
import TokensSetting from 'pages/TokensSetting.vue'
import Backup from 'pages/Backup'
import Account from 'pages/Account.vue'
import Activities from 'pages/Activities'
import ResetPin from 'pages/ResetPin.vue'
import AccountTransferLogs from 'pages/AccountTransferLogs.vue'
import Send from 'pages/Send.vue'
import Sign from 'pages/Sign'

const routes: RouteConfig[] = [
    {
        path: '/',
        component: Main,
        children: [{
            path: '',
            name: 'index',
            component: Index,
            meta: { title: 'Sync', hasMenu: true }
        }, {
            path: 'settings',
            name: 'settings',
            component: Settings,
            meta: { title: 'Settings' }
        }, {
            path: 'tokens-setting',
            name: 'tokens-setting',
            component: TokensSetting,
            meta: { title: 'Tokens' }
        }, {
            path: 'backup',
            name: 'backup',
            component: Backup,
            meta: { title: 'Backup' }
        }, {
            path: 'account',
            name: 'account',
            component: Account,
            meta: { title: 'Account' }
        }, {
            // this entry is to handle external signing request in SPA mode only
            path: 'sign',
            name: 'sign',
            component: Sign,
            meta: { title: 'Sign' }
        }, {
            path: 'activities',
            name: 'activities',
            component: Activities,
            meta: { title: 'Activities' }
        }, {
            path: 'reset-pin-code',
            name: 'reset-pin-code',
            component: ResetPin,
            meta: {
                title: 'Password'
            }
        }, {
            path: 'account-transfer-logs',
            name: 'account-transfer-logs',
            component: AccountTransferLogs,
            beforeEnter(to: Route, from: Route, next: NavigationGuardNext<Vue>) {
                to.meta.title = to.query.symbol
                next()
            },
            meta: {
                title: ''
            }
        }, {
            path: 'send',
            name: 'send',
            component: Send,
            meta: {
                title: 'Send'
            }
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
