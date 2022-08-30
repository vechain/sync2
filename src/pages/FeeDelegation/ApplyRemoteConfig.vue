<template>
  <q-dialog ref="dialog" @hide="$emit('hide')" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <page-toolbar :title="$t('feeDelegation.title')" icon="close" @action="hide()" />
      <page-content class="col q-pa-sm bg-grey-3">
        {{$t('feeDelegation.accept_remote_config')}}
        <q-card flat class="bg-yellow-1">
          <q-card-section class="serif" style="min-height:300px; white-space: pre-wrap;">{{  configAsText  }}
          </q-card-section>
        </q-card>
      </page-content>
      <page-action>
        <q-btn class="full-width" outline color="primary" :label="$t('common.dismiss')" @click="hide()" />
        <q-btn class="full-width" unelevated color="primary" :label="$t('common.confirm')" @click="ok()" />
      </page-action>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import PageToolbar from 'components/PageToolbar.vue'
import PageAction from 'src/components/PageAction.vue'
import PageContent from 'src/components/PageContent.vue'

export default Vue.extend({
    components: { PageToolbar, PageAction, PageContent },
    props: {
        state: Object as () => {}
    },
    computed: {
        configAsText() {
            if (this.state === undefined) {
                return ''
            }

            return JSON.stringify(this.state, null, 2)
        }
    },
    methods: {
    // method is REQUIRED by $q.dialo
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok() {
            this.$emit('ok', true)
        }
    }
})
</script>
