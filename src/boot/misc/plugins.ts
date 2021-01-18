import Vue from 'vue'
import AsyncComputed from 'vue-async-computed'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fragment = require('vue-fragment')
import VueGtag from 'vue-gtag'

export function boot() {
    Vue.use(AsyncComputed, { errorHandler: false } as never)
    Vue.use(Fragment.Plugin)
    Vue.use(VueGtag, {
        config: { id: '259251618' },
        enabled: process.env.NODE_ENV === 'production',
        disableScriptLoad: process.env.NODE_ENV !== 'production'
    })
}
