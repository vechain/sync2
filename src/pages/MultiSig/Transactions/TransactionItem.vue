<template>
  <q-expansion-item group="token" v-bind="$attrs" expand-icon-class="hidden">
    <template v-slot:header>

      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
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
        <q-item-label caption>From</q-item-label>
        <q-item-label style="word-break:break-all">
          <address-label :addr="log.from" full>null</address-label>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label caption>To</q-item-label>
        <q-item-label style="word-break:break-all">
          <address-label :addr="log.to" full>null</address-label>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label caption>Value</q-item-label>
        <q-item-label>
          <amount-label :value="log.value" :decimals="18" />
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label caption>Data</q-item-label>
        <q-item-label>
          <q-input v-if="!transaction.fnName && log.data && log.data.length > 2" dense class="monospace"
            type="textarea" standout readonly :value="log.data" />
          <q-input v-else-if="transaction.fnName" dense class="monospace" type="textarea" standout readonly
            :value="JSON.stringify({ [transaction.fnName]: transaction.parameters }, null, 2)" />
          <template v-else>N/A</template>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="!transaction.executed && log.from">
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
    <q-item>
      <q-item-section />
      <q-item-section />
      <q-item-section side>
        <div class="q-gutter-md">
          <q-btn rounded @click="copy(log.meta.txID)" flat dense icon="content_copy" />
          <q-btn rounded @click="viewOnExplorer" dense flat icon="search" />
        </div>
      </q-item-section>
    </q-item>

  </q-expansion-item>
</template>
<script lang="ts">
import Vue from 'vue'
import Contract, { Signatures } from '../const'
import { MultiSigTransactionLog, MultiSigTransactionItem } from '../models'
import AmountLabel from 'components/AmountLabel.vue'
import AddressLabel from 'components/AddressLabel.vue'
import { abi } from 'thor-devkit'
import { openURL } from 'src/utils/open-url'
import { copyText } from 'src/utils/clipboard'
import { urls, genesises } from 'src/consts'

export default Vue.extend({
    components: {
        AmountLabel, AddressLabel
    },
    props: {
        log: Object as () => MultiSigTransactionLog,
        address: String,
        signer: String,
        gid: String,
        walletId: String,
        confirmationsRequired: Number
    },
    asyncComputed: {
        transaction: {
            async get(): Promise<MultiSigTransactionItem> {
                try {
                    const { decoded: transaction } = await this.thor
                        .account(this.address)
                        .method(Contract.transactions)
                        .call(this.log.txIndex)

                    const { decoded: { 0: isConfirmed } } = await this.thor
                        .account(this.address)
                        .method(Contract.isConfirmed)
                        .call(this.log.txIndex, this.signer)

                    if (transaction.to === this.address && this.log.data.length > 2) {
                        const sigHash = this.log.data.slice(0, 10)
                        if (Signatures[sigHash]) {
                            try {
                                const inputParameters = Signatures[sigHash].inputs.map(({ name }) => name)
                                const parameters = abi.decodeParameters(Signatures[sigHash].inputs, '0x' + transaction.data.slice(10))
                                transaction.parameters = inputParameters.reduce((map: { [key: string]: string }, name: string) => {
                                    map[name] = parameters[name] || null
                                    return map
                                }, {})
                                transaction.fnName = Signatures[sigHash].name
                            } catch { }
                        }
                    }

                    return {
                        executed: transaction.executed,
                        numConfirmations: transaction.numConfirmations,
                        isConfirmed: !!isConfirmed,
                        fnName: transaction.fnName,
                        parameters: transaction.parameters
                    }
                } catch {
                    return {
                        executed: false,
                        numConfirmations: 0,
                        isConfirmed: false
                    }
                }
            },
            default: { executed: false, numConfirmations: 0, isConfirmed: false }
        }
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.gid).thor },
        title(): string {
            const number = Number(this.log.txIndex) + 1
            const title = [`#${number}`]
            if (this.transaction && this.transaction.fnName) {
                title.push(this.transaction.fnName)
            } else {
                title.push(this.$t('common.transaction').toString())
            }
            return title.join(' ')
        },
        txDetailUrl(): string {
            switch (genesises.which(this.gid)) {
                case 'main':
                    return `${urls.explorerMain}transactions/`
                case 'test':
                    return `${urls.explorerTest}transactions/`
                default:
                    return ''
            }
        }
    },
    methods: {
        viewOnExplorer() {
            openURL(`${this.txDetailUrl}${this.log.meta.txID}`)
        },
        copy(str: string) {
            copyText(str).then(() => {
                this.$q.notify(this.$t('common.copied'))
            }).catch(console.error)
        },
        async confirmTransaction() {
            if (!this.signer) {
                return
            }

            try {
                const clause = this.thor.account(this.address)
                    .method(Contract.confirmTransaction)
                    .asClause(this.log.txIndex)

                await this.$signTx(this.gid, {
                    message: [clause],
                    options: {
                        signer: this.signer,
                        comment: this.$t('transactionsMultiSig.action_confirm_transaction').toString()
                    }
                })

                this.$router.push({ name: 'sign-success-multisig', query: { walletId: this.walletId, addressIndex: '0' } })
            } catch (err) {

            }
        },
        async executeTransaction() {
            if (!this.signer) {
                return
            }

            try {
                const clause = this.thor.account(this.address)
                    .method(Contract.executeTransaction)
                    .asClause(this.log.txIndex)

                await this.$signTx(this.gid, {
                    message: [clause],
                    options: {
                        signer: this.signer,
                        comment: this.$t('transactionsMultiSig.action_execute_transaction').toString()
                    }
                })
            } catch (err) {

            }

            this.$router.push({ name: 'sign-success-multisig', query: { walletId: this.walletId, addressIndex: '0' } })
        },
        async revokeConfirmation() {
            if (!this.signer) {
                return
            }

            try {
                const clause = this.thor.account(this.address)
                    .method(Contract.revokeConfirmation)
                    .asClause(this.log.txIndex)

                await this.$signTx(this.gid, {
                    message: [clause],
                    options: {
                        signer: this.signer,
                        comment: this.$t('transactionsMultiSig.action_revoke_confirmation').toString()
                    }
                })

                this.$router.push({ name: 'sign-success-multisig', query: { walletId: this.walletId, addressIndex: '0' } })
            } catch (err) {

            }
        }
    }
})
</script>
