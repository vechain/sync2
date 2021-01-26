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
                terms: this.$t('disclaimer.title_dist_tag'),
                acceptLabel: this.$t('disclaimer.msg_dist_tag')
            })
            localStorage.setItem(KEY_UNSTABLE_ACCEPTED, 't')
        }

        if (!localStorage.getItem(KEY_ASSET_RISK_ACCEPTED)) {
            await this.$dialog({
                component: TermsDialog,
                terms: this.$t('disclaimer.title_terms'),
                acceptLabel: this.$t('disclaimer.msg_terms')
            })
            localStorage.setItem(KEY_ASSET_RISK_ACCEPTED, 't')
        }
    },
    render(h) {
        return h()
    }
})
