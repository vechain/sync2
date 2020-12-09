<template>
    <div
        class="fit column no-wrap"
        v-if="wallet"
    >
        <page-toolbar
            title="Account"
            :gid="wallet.gid"
        />
        <div class="q-mx-sm">
            <AddressInfo :address="address"> {{wallet.meta.name + ' #' + (addressIndex + 1)}} </AddressInfo>
        </div>
        <div class="q-px-md row items-center justify-between">
            <span class="text-h6 q-py-sm"> Assets </span>
            <q-btn
                :to="{name: 'tokens-setting'}"
                flat
                dense
                icon="add"
                aria-label="manage"
                size="md"
            />
        </div>
        <div
            class="q-px-xs col scroll"
            v-scrollDivider.both
        >
            <q-list>
                <template v-for="(token, index) in tokenList">
                    <resolve
                        :promise="$svc.bc(token.gid).balanceOf(address, token)"
                        v-slot="{data}"
                        :key="token.symbol"
                    >
                        <TokenItem
                            :token="token"
                            :balance="data"
                            @click="onTokenClick(token.symbol)"
                        />
                        <q-separator
                            v-if="index !== tokenList.length - 1"
                            inset="item"
                        />
                    </resolve>
                </template>
            </q-list>
        </div>
        <div class="row q-mt-auto justify-evenly q-py-lg">
            <q-btn
                class="col-5 col-sm-auto"
                @click="onSend"
                unelevated
                color="blue-9"
                label="Send"
            />
            <q-btn
                outline
                color="blue-9"
                unelevated
                @click="showQR = true"
                label="Receive"
                class="col-5 col-sm-auto"
            />
        </div>
        <ReceiveDialog
            v-model="showQR"
            :address="address"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TokenItem from './TokenItem.vue'
import ReceiveDialog from './ReceiveDialog.vue'

export default Vue.extend({
    name: 'Account',
    components: {
        TokenItem,
        ReceiveDialog
    },
    data() {
        return {
            showQR: false
        }
    },
    props: {
        wid: String,
        i: String
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.wid))
        },
        tokenList: {
            async get(): Promise<M.TokenSpec[]> {
                const [w, tokens, activeSymbols] = await Promise.all(
                    [
                        this.$svc.wallet.get(parseInt(this.wid)),
                        this.$svc.config.token.all(),
                        this.$svc.config.token.activeSymbols()
                    ]
                )
                return tokens.filter(token => token.gid === w!.gid && (activeSymbols.includes(token.symbol) || token.permanent))
            },
            default: []
        }
    },
    computed: {
        addressIndex(): number {
            return parseInt(this.i, 10)
        },
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[this.addressIndex] : ''
        }
    },
    methods: {
        onTokenClick(sym: string) {
            this.$router.push({
                name: 'account-transfer-logs',
                query: {
                    wid: this.wid,
                    i: this.i,
                    symbol: sym
                }
            })
        },
        onSend() {
            this.$router.push({
                name: 'send',
                query: {
                    wId: this.wid,
                    i: this.i
                }
            })
        }
    }
})
</script>
