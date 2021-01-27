import Vue from 'vue'
import TermsDialog from './TermsDialog.vue'

const KEY_UNSTABLE_ACCEPTED = 'unstable-accepted'
const KEY_DISCLAIMER_ACCEPTED = 'disclaimer-accepted'

export default Vue.extend({
    async mounted() {
        if (process.env.DIST_TAG &&
            !localStorage.getItem(KEY_UNSTABLE_ACCEPTED)) {
            await this.$dialog({
                component: TermsDialog,
                terms: {
                    msg: () => this.$t('disclaimer.msg_unstable_terms').toString(),
                    label: () => this.$t('disclaimer.label_unstable_terms_accept').toString()
                }
            })
            localStorage.setItem(KEY_UNSTABLE_ACCEPTED, 't')
        }

        if (!localStorage.getItem(KEY_DISCLAIMER_ACCEPTED)) {
            await this.$dialog({
                component: TermsDialog,
                terms: {
                    msg: () => this.$t('disclaimer.msg_disclaimer_terms').toString(),
                    label: () => this.$t('disclaimer.label_disclaimer_terms_accept').toString()
                }
            })
            localStorage.setItem(KEY_DISCLAIMER_ACCEPTED, 't')
        }
    },
    render(h) {
        return h()
    }
})
