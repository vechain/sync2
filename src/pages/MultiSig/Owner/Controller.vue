<template>
    <div class="column fit">
        <page-toolbar :title="$t('ownerMultiSig.title')" />
        <page-content class="col">
            <q-item dense>
                <q-item-section>
                    <q-item-label header>{{$t('ownerMultiSig.required_confirmations')}}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn @click="onChangeRequiredConfirmations" flat>
                        {{confirmationsRequired}} / {{owners.length}}
                        <q-icon name="edit" size="xs" />
                    </q-btn>
                </q-item-section>
            </q-item>
            <q-item dense>
                <q-item-section>
                    <q-item-label header>
                        {{ $t('ownerMultiSig.title_owners') }}
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn @click="onAdd" flat round icon="add" />
                </q-item-section>
            </q-item>
            <q-list padding>
                <template v-for="(ownerAddress, index) in owners">
                    <q-separator v-if="index !== 0" :key="ownerAddress + 'sep'" inset="item" />
                    <q-item :key="ownerAddress">
                        <q-item-section>
                            <q-item-label lines="1">{{ ownerAddress }}</q-item-label>
                        </q-item-section>
                        <q-btn @click="handleDelete(ownerAddress)" unelevated color="secondary" flat round
                            icon="delete" />
                    </q-item>
                </template>
            </q-list>
            <div class="text-center">
                <q-spinner-dots v-if="loading" />
            </div>
        </page-content>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageContent from 'components/PageContent.vue'
import PageToolbar from 'components/PageToolbar.vue'
import AddDialog from './AddDialog.vue'
import ChangeConfirmationsRequiredDialog from './ChangeConfirmationsRequiredDialog.vue'
import Contract from '../const'

export default Vue.extend({
    components: { PageContent, PageToolbar },
    props: {
        walletId: String
    },
    data: () => {
        return {
            confirmationsRequired: 1,
            loading: false,
            errors: {
                confirmationsRequired: ''
            }
        }
    },
    computed: {
        thor(): Connex.Thor { return this.$svc.bc(this.wallet!.gid).thor }
    },
    asyncComputed: {
        async wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.walletId))
        },
        async owners(): Promise<string[]> {
            if (!this.wallet) {
                return []
            }

            this.loading = true
            const { decoded: { 0: owners } } = await this.thor
                .account(this.wallet.meta.addresses[0])
                .method(Contract.getOwners)
                .call()

            this.loading = false
            return owners
        },
        confirmationsRequired: {
            async get(): Promise<number> {
                if (!this.wallet) {
                    return 0
                }

                const { decoded: { 0: count } } = await this.thor
                    .account(this.wallet.meta.addresses[0])
                    .method(Contract.numConfirmationsRequired)
                    .call()

                return parseInt(count)
            },
            default: 0
        }
    },
    methods: {
        async onAdd() {
            try {
                const address = await this.$dialog<string>({
                    component: AddDialog,
                    state: { address: '' }
                })

                const addOwnerClause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.addOwner)
                    .asClause(address)

                await this.$signTx(this.wallet!.gid, {
                    message: [addOwnerClause],
                    options: {
                        signer: this.wallet!.meta.addresses[0]
                    }
                })

                this.$router.push({ name: 'transactions-multisig', query: { walletId: this.walletId, addressIndex: '0' } })
            } catch { }
        },
        async onChangeRequiredConfirmations() {
            try {
                const confirmationsRequired = await this.$dialog<string>({
                    component: ChangeConfirmationsRequiredDialog,
                    state: { confirmationsRequired: this.confirmationsRequired }
                })

                const setConfirmationsRequiredClause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.setConfirmationsRequired)
                    .asClause(confirmationsRequired)

                await this.$signTx(this.wallet!.gid, {
                    message: [setConfirmationsRequiredClause],
                    options: {
                        signer: this.wallet!.meta.addresses[0]
                    }
                })

                this.$router.push({ name: 'transactions-multisig', query: { walletId: this.walletId, addressIndex: '0' } })
            } catch { }
        },
        async handleDelete(address: string) {
            try {
                await this.$dialog({
                    focus: 'cancel',
                    title: this.$t('common.delete').toString(),
                    message: this.$t('ownerMultiSig.msg_delete').toString(),
                    ok: {
                        label: this.$t('common.delete'),
                        color: 'negative',
                        outline: true
                    },
                    cancel: {
                        label: this.$t('common.cancel'),
                        unelevated: true
                    }
                })

                const removeOwnerClause = this.thor.account(this.wallet!.meta.addresses[0])
                    .method(Contract.removeOwner)
                    .asClause(address)

                await this.$signTx(this.wallet!.gid, {
                    message: [removeOwnerClause],
                    options: {
                        signer: this.wallet!.meta.addresses[0]
                    }
                })

                this.$router.push({ name: 'transactions-multisig', query: { walletId: this.walletId, addressIndex: '0' } })
            } catch { }
        }
    }
})
</script>
