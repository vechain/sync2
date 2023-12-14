<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column no-wrap">
            <page-toolbar
                :title="$t('backup.title')"
                icon="close"
                @action="hide()"
            />
            <backup-panel
                :wallet-id="walletId"
                :words="words"
                :meta="meta"
                :panel="panel"
                @start="next"
                @next="next"
                @done="onDone"
            />
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import BackupPanel from './BackupPanel.vue'
import PageToolbar from 'src/components/PageToolbar.vue'

export default Vue.extend({
    components: {
        QDialog,
        PageToolbar,
        BackupPanel
    },
    props: {
        walletId: Number,
        words: {
            type: Array as () => string[],
            default: () => []
        },
        meta: {
            type: Object as () => M.Wallet.Meta,
            default: () => {}
        }
    },
    data() {
        return {
            panel: 'notice' as 'notice' | 'words' | 'check' | 'done'
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        next() {
            switch (this.panel) {
                case 'notice':
                    this.panel = 'words'
                    break
                case 'words':
                    this.panel = 'check'
                    break
                case 'check':
                    this.panel = 'done'
                    break
            }
        },
        onDone() {
            this.hide()
        }
    }
})
</script>
