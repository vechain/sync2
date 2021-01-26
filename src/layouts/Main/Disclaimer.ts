import Vue from 'vue'
import TermsDialog from './TermsDialog.vue'

const KEY_UNSTABLE_ACCEPTED = 'unstable-accepted'
const KEY_ASSET_RISK_ACCEPTED = 'asset-risk-accepted'

export default Vue.extend({
    async mounted() {
        if (process.env.DIST_TAG &&
            !localStorage.getItem(KEY_UNSTABLE_ACCEPTED)) {
            await this.$dialog({
                component: TermsDialog,
                terms: 'Warning for UNSTABLE', // TODO
                acceptLabel: 'I know and still want to try it out' // TODO
            })
            localStorage.setItem(KEY_UNSTABLE_ACCEPTED, 't')
        }

        if (!localStorage.getItem(KEY_ASSET_RISK_ACCEPTED)) {
            await this.$dialog({
                component: TermsDialog,
                terms: 'Warning', // TODO
                acceptLabel: 'I...' // TODO
            })
            localStorage.setItem(KEY_ASSET_RISK_ACCEPTED, 't')
        }
    },
    render(h) {
        return h()
    }
})
