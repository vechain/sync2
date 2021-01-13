<template>
    <pop-sheets :sheets="sheets" />
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'
import PromptDialog, { PromptOptions } from './PromptDialog.vue'

const MAX_ADDRESS = 10

export default Vue.extend({
    components: { PopSheets },
    props: {
        wallet: Object as () => M.Wallet
    },
    computed: {
        sheets(): Sheet[] {
            return [{
                label: this.$t('index.action_new_address').toString(),
                action: () => { this.newAccount() },
                hidden: this.wallet.meta.addresses.length >= MAX_ADDRESS
            },
            {
                label: this.$t('index.action_backup').toString(),
                action: () => this.$router.push({ name: 'backup', params: { walletId: this.wallet.id.toString() } })
            },
            {
                label: this.$t('index.action_rename').toString(),
                action: () => this.rename()
            },
            {
                label: this.$t('common.delete').toString(),
                action: () => this.delete(),
                classes: 'text-negative',
                separator: true
            }]
        }
    },
    methods: {
        newAccount() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            this.$loading(async () => {
                const addresses = wallet.meta.addresses
                if (addresses.length >= MAX_ADDRESS) {
                    return
                }
                const vault = Vault.decode(wallet.vault)
                const newAddress = (await vault.derive(addresses.length)).address
                const newMeta: M.Wallet.Meta = {
                    ...wallet.meta,
                    addresses: [...addresses, newAddress]
                }

                await this.$svc.wallet.update(wallet.id, newMeta)
            })
        },
        async rename() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            try {
                const opts: PromptOptions = {
                    title: this.$t('index.action_rename').toString(),
                    message: '',
                    modal: this.wallet.meta.name,
                    action: {
                        label: this.$t('common.confirm').toString(),
                        color: 'primary'
                    },
                    validate: input => input.trim() ? '' : 'Input the name of wallet'
                }
                const newName = (await this.$dialog<string>({
                    component: PromptDialog,
                    opts
                })).trim()

                try {
                    await this.$svc.wallet.update(wallet.id, {
                        ...wallet.meta,
                        name: newName
                    })
                    this.$q.notify(this.$t('common.wallet_updated'))
                } catch (err) {
                    console.warn('rename wallet:', err)
                    this.$q.notify({
                        type: 'negative',
                        message: this.$t('common.something_wrong').toString()
                    })
                }
            } catch { }
        },
        async delete() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }

            try {
                const opts: PromptOptions = {
                    title: this.$t('common.delete').toString(),
                    message: this.$t('index.msg_delete').toString(),
                    modal: '',
                    action: {
                        label: this.$t('common.delete').toString(),
                        color: 'negative'
                    },
                    // ask user to type 'ok' to confirm
                    validate: input => input.toLowerCase() === 'ok' ? '' : this.$t('common.invalid_input').toString()
                }

                await this.$dialog<string>({
                    component: PromptDialog,
                    opts
                })
                await this.$authenticate()
                try {
                    await this.$svc.wallet.delete(wallet.id)
                    this.$q.notify(this.$t('common.wallet_deleted').toString())
                } catch (err) {
                    console.warn('delete wallet:', err)
                    this.$q.notify({
                        type: 'negative',
                        message: this.$t('common.something_wrong').toString()
                    })
                }
            } catch { }
        }
    }
})
</script>
