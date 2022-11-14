<template>
  <q-expansion-item group="token" v-bind="$attrs" expand-icon-class="hidden">
    <template v-slot:header>

      <q-item-section>
        <q-item-label>Transaction #{{ index + 1 }}</q-item-label>
      </q-item-section>
      <q-item-section side class="text-dark">
        <div v-if="!transaction.executed">
          {{ transaction.numConfirmations }} / {{ confirmationsRequired }}
          <q-icon class="q-pa-none" size="xs" name="person" color="info" />
        </div>
        <q-icon v-if="transaction.executed" class="q-pa-none" size="xs" name="done_all" color="positive" />
      </q-item-section>
    </template>
    <q-item>
      <q-item-section>
        <q-item-label caption>To</q-item-label>
        <q-item-label style="word-break:break-all">
          <address-label :addr="transaction.to" full>null</address-label>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label caption>Value (wei)</q-item-label>
        <q-item-label>
          <amount-label :value="transaction.value" :fixed="0" />
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label caption>Data</q-item-label>
        <q-item-label>
          <q-input v-if="transaction.data && transaction.data.length > 2" dense class="monospace" type="textarea"
            standout readonly :value="transaction.data" />
          <template v-else>N/A</template>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="!transaction.executed">
      <q-item-section>
        <div>
          <q-btn class="full-width" color="primary" unelevated
            :label="$t('transactionsMultiSig.action_confirm_transaction')" @click="confirmTransaction"
            v-if="!transaction.isConfirmed" />
          <q-btn class="full-width" color="primary" unelevated
            :label="$t('transactionsMultiSig.action_execute_transaction')" @click="executeTransaction"
            v-if="transaction.numConfirmations >= confirmationsRequired" />
        </div>
      </q-item-section>
    </q-item>
    <q-item v-if="!transaction.executed && transaction.isConfirmed">
      <q-item-section>
        <div>
          <q-btn class="full-width" color="negative" outline unelevated
            :label="$t('transactionsMultiSig.action_revoke_confirmation')" @click="revokeConfirmation"
            v-if="transaction.isConfirmed" />
        </div>
      </q-item-section>
    </q-item>
  </q-expansion-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AmountLabel from 'components/AmountLabel.vue'
import AddressLabel from 'components/AddressLabel.vue'

export default Vue.extend({
    components: {
        AmountLabel, AddressLabel
    },
    props: {
        transaction: Object as () => { to: string, isConfirmed: boolean, executed: boolean, numConfirmations: number, data: string },
        confirmationsRequired: Number as () => 0,
        index: Number as () => 0,
        confirmTransaction: Function as () => {},
        executeTransaction: Function as () => {},
        revokeConfirmation: Function as () => {}
    }
})
</script>
