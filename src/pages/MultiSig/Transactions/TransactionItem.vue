<template>
  <q-expansion-item group="token" v-bind="$attrs" expand-icon-class="hidden">
    <template v-slot:header>

      <q-item-section>
        <q-item-label>Transaction #{{ index }}</q-item-label>
      </q-item-section>
      <q-item-section side class="text-dark">
        <div v-if="!transaction.executed">
          {{ transaction.numConfirmations }} / {{ confirmationsRequired }}
          <q-icon class="q-pa-none" size="xs" name="person" color="info" />
        </div>
        <q-icon v-if="transaction.executed" class="q-pa-none" size="xs" name="done_all" color="positive" />
        <amount-label :value="transaction.value" :decimals="18"> --.-- </amount-label>
      </q-item-section>
    </template>
    <q-item>
      To: {{ transaction.to }}<br />
      Data: {{ transaction.data }}
    </q-item>
  </q-expansion-item>
</template>
<script lang="ts">
import Vue from 'vue'
import AmountLabel from 'components/AmountLabel.vue'

export default Vue.extend({
    components: {
        AmountLabel
    },
    props: {
        transaction: Object as () => any,
        confirmationsRequired: Number as () => 0,
        index: Number as () => 0
    }
})
</script>
