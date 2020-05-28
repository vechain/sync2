import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
    {
        path: '/',
        name: 'main',
        redirect: '/wallet',
        component: () => import('layouts/Main.vue'),
        children: [{
            path: '/wallet',
            name: 'wallet',
            component: () => import('pages/Wallet.vue')
        }, {
            path: '/settings',
            name: 'settings',
            component: () => import('pages/Settings.vue')
        }, {
            path: '/settings/tokens',
            name: 'tokens',
            component: () => import('pages/TokenList.vue')
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
