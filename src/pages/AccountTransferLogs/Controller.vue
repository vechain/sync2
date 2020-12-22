<template>
    <div
        class="fit column no-wrap"
        v-if="wallet"
    >
        <page-toolbar
            :title="symbol"
            :gid="wallet.gid"
        />
        <div class="col column no-wrap narrow-page q-mx-auto">
            <resolve
                v-if="token"
                :promise="$svc.bc(token.gid).balanceOf(address, token)"
                v-slot={data}
            >
                <token-balance-item
                    :token="token"
                    :balance="data"
                />
            </resolve>
            <span class="text-h6 q-py-sm q-px-md">{{$t('accountTransfer.label_transfer')}}</span>
            <div
                class="scroll "
                v-scrollDivider.both
            >
                <Logs
                    v-if="token"
                    :address="address"
                    :token="token"
                    :pageSize="20"
                />
            </div>
            <div class="row q-mt-auto q-pa-sm justify-around">
                <q-btn
                    class="w40"
                    unelevated
                    color="blue-9"
                    outline
                    @click="showQR = true"
                    label="Receive"
                />
                <q-btn
                    class="w40"
                    :to="{name: 'send', query: { wid: wid, i: i, defaultSymbol: symbol }}"
                    unelevated
                    color="blue-9"
                    label="Send"
                />
            </div>
        </div>
        <ReceiveDialog
            v-model="showQR"
            :address="address"
        />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Logs from './Logs.vue'
import ReceiveDialog from 'src/pages/ReceiveDialog.vue'
export default Vue.extend({
    name: 'AccountTransferLogs',
    components: {
        Logs,
        ReceiveDialog
    },
    data() {
        return {
            showQR: false
        }
    },
    props: {
        wid: String,
        i: String,
        symbol: String
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.wid))
        },
        token: {
            async get(): Promise<M.TokenSpec | null> {
                const wallet = this.wallet
                if (!wallet) {
                    return null
                }
                const [tokens, activeSymbols] = await Promise.all([
                    this.$svc.config.token.all(),
                    this.$svc.config.token.activeSymbols()
                ])
                return tokens.filter(token => {
                    return token.gid === wallet.gid &&
                        (activeSymbols.includes(token.symbol) || token.permanent)
                }).find(token => token.symbol === this.symbol) || null
            },
            default: null
        }
    },
    computed: {
        addressIndex(): number {
            return parseInt(this.i, 10)
        },
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[this.addressIndex] : ''
        }
    }
})
</script>
