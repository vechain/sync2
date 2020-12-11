import Vue from 'vue'
import AsyncComputed from 'vue-async-computed'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fragment = require('vue-fragment')

export function boot() {
    Vue.use(AsyncComputed)
    Vue.use(Fragment.Plugin)
}
