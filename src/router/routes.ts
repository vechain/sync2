import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
    {
        path: '/',
        component: () => import('layouts/Main.vue'),
        children: [{
            path: '',
            name: 'index',
            component: () => import('pages/Index.vue'),
            meta: { title: 'Sync', hasMenu: true }
        }, {
            path: '/settings',
            name: 'settings',
            component: () => import('pages/Settings.vue'),
            meta: { title: 'Settings' }
        }, {
            path: '/settings/tokens',
            name: 'tokens',
            component: () => import('pages/TokenList.vue'),
            meta: { title: 'Tokens' }
        }, {
            path: '/wallet/backup',
            name: 'backup',
            component: () => import('pages/Backup.vue'),
            meta: { title: 'Backup' }
        }, {
            path: '/wallet/account',
            name: 'account',
            component: () => import('pages/Account.vue'),
            meta: { title: 'Account' }
        }, {
            // this page is for handling external signing request in SPA mode only
            path: 'sign',
            name: 'sign',
            component: () => import('pages/Sign.vue'),
            meta: { title: 'Sign', noTransitionIn: true, noTransitionOut: true }
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
