import { RouteConfig } from 'vue-router'
import Main from 'layouts/Main.vue'
import Index from 'pages/Index.vue'
import Settings from 'pages/Settings.vue'
import TokensSetting from 'pages/TokensSetting.vue'
import Backup from 'pages/Backup.vue'
import Account from 'pages/Account.vue'
import Sign from 'pages/Sign.vue'
import Activities from 'pages/Activities.vue'
import ResetPin from 'pages/ResetPin.vue'

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
            // this page is for handling external signing request in SPA mode only
            path: 'sign',
            name: 'sign',
            component: Sign,
            meta: { title: 'Sign', noTransitionIn: true, noTransitionOut: true }
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
                title: 'Change Master Code'
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
