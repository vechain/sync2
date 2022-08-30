<template>
  <q-dialog ref="dialog" @hide="$emit('hide')" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <page-toolbar :title="$t('feeDelegation.title')" icon="close" :gid="gid" @action="hide()" />
      <page-content class="col q-pa-sm bg-grey-3">
        {{$t('feeDelegation.accept_remote_config')}}
        <q-card flat class="bg-yellow-1">
          <q-card-section class="serif" style="min-height:300px; white-space: pre-wrap;">
            {{JSON.stringify(state, "", 2)}}
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

export default Vue.extend({

  components: { PageToolbar },
  props: {
    state: Object as () => { }
  },
  computed: {
  },
  methods: {
    // method is REQUIRED by $q.dialog
    show() { (this.$refs.dialog as QDialog).show() },
    // method is REQUIRED by $q.dialog
    hide() { (this.$refs.dialog as QDialog).hide() },

    ok() {
      this.$emit('ok', true)
      this.hide()
    }
  }
})
</script>
