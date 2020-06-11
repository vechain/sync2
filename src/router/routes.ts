import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
    {
        path: '/',
        component: () => import('layouts/Main.vue'),
        children: [{
            path: '',
            name: 'index',
            component: () => import('pages/Index.vue')
        }, {
            path: '/settings',
            name: 'settings',
            component: () => import('pages/Settings.vue')
        }, {
            path: '/settings/tokens',
            name: 'tokens',
            component: () => import('pages/TokenList.vue')
        }, {
            path: '/wallet/backup',
            name: 'backup',
            component: () => import('pages/Backup.vue')
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
