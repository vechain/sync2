<template>
    <q-item
        :clickable="isSelectable"
    >
        <connex-continuous
            :connex="connex"
            :query="() => connex.thor.account(signer).get()"
            v-slot="{data}"
        >
            <q-item-section avatar>
                <AddressAvatar
                    class="q-mx-auto"
                    style="width: 65px; height: 35px; border-radius: 5px;"
                    :addr="signer"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label class="monospace text-body2">{{ signer | checksum | abbrev(8, 6) }}</q-item-label>
                <q-item-label
                    caption
                    lines="1"
                >
                    <template v-if="data">
                        {{data.balance | balance(18)}}
                    </template>
                    <q-spinner-dots
                        v-else
                        color="blue"
                    />
                    VET
                </q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon
                    v-if="isSelectable"
                    name="keyboard_arrow_right"
                />
            </q-item-section>
        </connex-continuous>
        <q-popup-proxy
            v-model="show"
            :no-parent-event="!isSelectable"
            position="bottom"
            breakpoint="2000"
            :context-menu="false"
        >
            <q-card
                class="column full-width no-wrap"
            >
                <q-toolbar>
                    <q-toolbar-title>Select</q-toolbar-title>
                </q-toolbar>
                <q-card-section
                    v-scrollDivider
                    class="col overflow-auto q-pt-none"
                >
                    <AccountList
                        :wallets="wallets"
                        v-model="signer"
                        v-slot="{address}"
                        @tabChange="AccountTabChange"
                        @change="signerChange"
                    >
                        <slot
                            v-if="currentAccountTab === address"
                            :address="address"
                        />
                    </AccountList>
                </q-card-section>
            </q-card>
        </q-popup-proxy>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    model: {
        prop: 'current',
        event: 'change'
    },
    props: {
        connex: Object as () => Connex,
        wallets: Array as () => M.Wallet[],
        isSelectable: Boolean,
        current: String
    },
    data() {
        return {
            show: false,
            signer: this.current || this.wallets[0].meta.addresses[0],
            currentAccountTab: ''
        }
    },
    methods: {
        AccountTabChange(account: string) {
            this.currentAccountTab = account
        },
        signerChange(account: string) {
            this.$emit('change', account)
            this.show = false
        }
    }
})
</script>
