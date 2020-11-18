<template>
    <Item :info="info">
        <template v-slot:status>
            <q-icon
                class="q-pa-sm"
                size="xs"
                name="mdi-check-circle-outline"
                color="positive"
            />
        </template>
    </Item>
</template>
<script lang="ts">
import Vue from 'vue'
import Item, { Info } from './Item.vue'
export default Vue.extend({
    components: {
        Item
    },
    props: {
        activity: Object as () => M.Activity<'cert'>,
        walletNames: Object as () => { [key: number]: string }
    },
    computed: {
        info(): Info {
            const link = (this.activity.glob.referer && this.activity.glob.referer.url) || ''
            return {
                gid: this.activity.gid,
                walletName: this.walletNames[this.activity.walletId],
                comment: this.activity.glob.message.purpose === 'identification' ? 'Identification' : 'Agreement',
                link: link,
                signer: this.activity.glob.signer,
                refererText: link ? Vue.filter('urlHost')(link) : '',
                time: `Cert · ${Vue.filter('dateTime')(this.activity.createdTime)}`,
                message: this.activity.glob && this.activity.glob.message.payload.content
            }
        }
    }
})
</script>
