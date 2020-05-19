import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
    {
        path: '/',
        name: 'main',
        component: () => import('layouts/Main.vue'),
        children: [{
            path: '/wallet',
            name: 'wallet',
            component: () => import('pages/Wallet.vue')
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
