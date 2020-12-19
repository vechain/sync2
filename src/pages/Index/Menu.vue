<template>
    <pop-sheets :sheets="sheets" />
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'

const MAX_ADDRESS = 10

export default Vue.extend({
    components: { PopSheets },
    props: {
        wallet: Object as () => M.Wallet
    },
    computed: {
        sheets(): Sheet[] {
            const addressFull = this.wallet.meta.addresses.length >= MAX_ADDRESS
            return [{
                label: this.$t('index.action_new_account').toString(),
                action: () => { addressFull || this.newAccount() },
                classes: addressFull ? 'text-grey' : ''
            },
            {
                label: this.$t('index.action_backup').toString(),
                action: () => this.$router.push({ name: 'backup' })
            },
            {
                label: this.$t('index.action_rename').toString(),
                action: () => this.rename()
            },
            {
                label: this.$t('common.delete').toString(),
                action: () => this.delete(),
                classes: 'text-negative'
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
                const vault = await Vault.decode(wallet.vault)
                const newAddress = (await vault.derive(addresses.length)).address
                const newMeta: M.Wallet.Meta = {
                    ...wallet.meta,
                    addresses: [...addresses, newAddress]
                }

                await this.$svc.wallet.update(wallet.id, newMeta)
            })
        },
        rename() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            this.$q.dialog({
                parent: this,
                title: this.$t('index.action_rename').toString(),
                message: this.$t('index.msg_rename').toString(),
                prompt: {
                    model: '',
                    isValid: (val: string) => { return !!val && !!val.trim() },
                    type: 'text'
                },
                cancel: true,
                ok: {
                    label: this.$t('common.confirm').toString()
                }
            }).onOk((data: string) => {
                this.$svc.wallet.update(wallet.id, {
                    ...wallet.meta,
                    name: data
                }).then(() => {
                    this.$q.notify(this.$t('common.wallet_updated'))
                })
            })
        },
        delete() {
            const wallet = this.wallet
            if (!wallet) {
                return
            }
            this.$q.dialog({
                parent: this,
                title: this.$t('common.delete').toString(),
                message: this.$t('index.msg_delete').toString(),
                ok: {
                    label: this.$t('common.yes').toString(),
                    color: 'negative'
                },
                cancel: {
                    label: this.$t('common.no').toString(),
                    flat: true
                }
            }).onOk(async () => {
                await this.$authenticate()
                await this.$svc.wallet.delete(wallet.id)
            })
        }
    }
})
</script>
