import Vue from 'vue'
import AsyncComputed from 'vue-async-computed'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fragment = require('vue-fragment')
import VueGtag from 'vue-gtag'

export function boot() {
    Vue.use(AsyncComputed)
    Vue.use(Fragment.Plugin)
    Vue.use(VueGtag, {
        config: { id: 'G-6QEHC6TLQV' },
        enabled: process.env.PROD,
        disableScriptLoad: !process.env.PROD
    })
}
