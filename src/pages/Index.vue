<template>
    <div>
        <div v-if="wallet">
            <q-toolbar>
                <q-toolbar-title> {{wallet.meta.name}}</q-toolbar-title>
                <q-btn
                    flat
                    dense
                    round
                    icon="more_horiz"
                    aria-label="More"
                >
                    <q-menu>
                        <q-list>
                            <q-item>
                                <q-item-section>Accounts</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Activity</q-item-section>
                            </q-item>
                            <q-item
                                v-close-popup
                                :to="{name: 'backup'}"
                            >
                                <q-item-section>Backup</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Delete</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-toolbar>
            <div class="row justify-center q-gutter-lg">
                <q-responsive
                    v-for="(card, i) in cards"
                    :key="i"
                    :ratio="3/2"
                    style="width:280px"
                >
                    <AddressCard
                        class="shadow-4"
                        :address="card.address"
                        :index="i"
                    />
                </q-responsive>
                <q-responsive
                    :ratio="3/2"
                    style="width:280px"
                >
                    <div class="row flex-center">
                        <q-btn
                            flat
                            @click="onNewAddress"
                        >New</q-btn>
                    </div>
                </q-responsive>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from 'core/vault'

export default Vue.extend({
    computed: {
        wallet(): M.Wallet | null {
            return this.$state.wallet.current
        },
        node(): M.Node | null {
            return this.wallet
                ? (this.$state.config.node.list.find(n => n.gid === this.wallet!.gid) || null)
                : null
        },
        cards(): M.Wallet.Card[] {
            return this.wallet ? this.wallet.meta.cards : []
        }
    },
    methods: {
        async onNewAddress() {
            const wallet = this.wallet
            if (wallet) {
                const vault = await Vault.decode(wallet.vault)
                const newAddress = (await vault.derive(wallet.meta.cards.length)).address
                const newMeta: M.Wallet.Meta = {
                    ...wallet.meta,
                    cards: [...wallet.meta.cards, { address: newAddress }]
                }
                console.log(newMeta)

                await this.$storage.wallets.update(
                    { id: wallet.id },
                    { meta: JSON.stringify(newMeta) })
            }
        }
    }
})
</script>
