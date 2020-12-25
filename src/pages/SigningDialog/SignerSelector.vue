<template>
    <q-item
        :clickable="isSelectable"
        v-if="signer"
    >
        <q-item-section avatar>
            <address-avatar :addr="signer" />
        </q-item-section>
        <q-item-section>
            <q-item-label class="monospace text-body2">{{ signer | checksum | abbrev(8, 6) }}</q-item-label>
            <q-item-label
                caption
                lines="1"
            >
                <!-- <template v-if="data">
                    {{data.balance | balance(18)}}
                </template>
                <q-spinner-dots
                    v-else
                    color="blue"
                />
                VET -->
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-icon
                v-if="isSelectable"
                name="keyboard_arrow_right"
            />
        </q-item-section>
        <pop-sheets
            fit
            :sheets="sheets"
        >
            <template v-slot={sheet:{model:wallet}}>
                <q-item-label
                    header
                    :key="wallet.id"
                >{{wallet.meta.name}}</q-item-label>

                <q-expansion-item
                    v-scrollIntoView="currentAccountTab === address || current === address "
                    v-close-popup
                    :default-opened="current === address"
                    group="somegroup"
                    v-for="address in wallet.meta.addresses"
                    :key="`${address}-${wallet.id}`"
                    expand-icon-toggle
                    @before-show="AccountTabChange(address)"
                >
                    <template v-slot:header>
                        <q-item-section
                            avatar
                            class="q-mr-none"
                            @click="$emit('change', address)"
                        >
                            <AddressAvatar :addr="address" />
                        </q-item-section>
                        <q-item-section
                            @click="$emit('change', address)"
                            class="monospace"
                            :class="{'text-primary': (current === address)}"
                        >
                            {{address | checksum | abbrev(8,6)}}
                        </q-item-section>
                    </template>
                    <q-list v-if="currentAccountTab === address">
                        <async-resolve
                            v-for="token in tokenList"
                            :key="token.symbol"
                            :promise="$svc.bc(token.gid).balanceOf(address, token)"
                            v-slot="{data}"
                        >
                            <token-balance-item
                                :balance="data"
                                :token="token"
                            />
                        </async-resolve>
                    </q-list>
                </q-expansion-item>
            </template>
        </pop-sheets>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import AsyncResolve from 'components/AsyncResolve'
import TokenBalanceItem from 'components/TokenBalanceItem.vue'

export default Vue.extend({
    components: {
        PopSheets,
        AsyncResolve,
        AddressAvatar,
        TokenBalanceItem
    },
    model: {
        prop: 'current',
        event: 'change'
    },
    props: {
        tokenList: Array as () => M.TokenSpec[],
        wallets: Array as () => M.Wallet[],
        isSelectable: { type: Boolean, default: false },
        current: String
    },
    mounted() {
        if (this.current === '') {
            this.$emit('change', this.wallets[0].meta.addresses[0])
        }
    },
    computed: {
        sheets(): Sheet<M.Wallet>[] {
            return this.wallets.map<Sheet<M.Wallet>>(w => {
                return {
                    label: '',
                    action: () => { },
                    model: w
                }
            })
        }
    },
    data() {
        return {
            show: false,
            signer: this.current || this.wallets[0].meta.addresses[0],
            currentAccountTab: this.current || this.wallets[0].meta.addresses[0]
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
    },
    directives: {
        scrollIntoView: {
            inserted(el, binding) {
                if (binding.value === true) {
                    el.scrollIntoView()
                }
            }
        }
    }
})
</script>
