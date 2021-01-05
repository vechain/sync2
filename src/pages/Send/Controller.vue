<template>
    <q-form
        class="column fit"
        v-if="tokenList.length"
        @submit="onSend"
    >
        <page-toolbar :title="$t('send.title')" />
        <page-content class="col no-wrap">
            <q-item-label header>{{$t('send.label_to')}}</q-item-label>
            <To
                v-model="to"
                class="q-mx-md"
                :wallets="toWallets"
                :error-message="errors.to"
                :error="!!errors.to"
                @change="errors.to = ''"
            />
            <div class="text-right q-mx-md">
                <q-btn
                    v-if="hasCamera"
                    rounded
                    dense
                    label="Scan QR Code"
                    flat
                    @click="onClickScan"
                />
            </div>
            <q-item-label header>Token</q-item-label>
            <TokenSelector
                :tokens="tokenList"
                v-model="symbol"
                :address="address"
            />
            <q-item-label header>{{$t('send.label_amount')}}</q-item-label>
            <q-input
                no-error-icon
                autocomplete="off"
                class="q-mx-md"
                v-model="amount"
                :error-message="errors.amount"
                :error="!!errors.amount"
                @input="errors.amount = ''"
                dense
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                outlined
            />
        </page-content>
        <page-action>
            <q-btn
                type="submit"
                unelevated
                class="col-6 col-sm-auto"
                color="blue-9"
                :label="$t('send.action_proceed')"
            />
        </page-action>
    </q-form>
</template>
<script lang="ts">
import Vue from 'vue'
import { abi, address } from 'thor-devkit'
import { abis } from 'src/consts'
import To from './To.vue'
import TokenSelector from './TokenSelector.vue'
import { AddressGroup } from './models'
import QrScannerDialog from 'pages/QrScannerDialog'
import { QrScanner } from 'src/utils/qr-scanner'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'components/PageContent.vue'
import PageAction from 'components/PageAction.vue'

export default Vue.extend({
    components: {
        To,
        TokenSelector,
        PageToolbar,
        PageContent,
        PageAction
    },
    props: {
        wid: String,
        i: String,
        defaultSymbol: String
    },
    data() {
        return {
            to: null as unknown as string,
            amount: '',
            symbol: this.defaultSymbol || 'VET',
            errors: {
                to: '',
                amount: ''
            }
        }
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.wid))
        },
        recent: {
            async get(): Promise<string[]> {
                return this.$svc.config.getRecentRecipients()
            },
            default: []
        },
        wallets: {
            async get(): Promise<M.Wallet[]> {
                if (!this.wallet) {
                    return []
                }
                return await this.$svc.wallet.getByGid(this.wallet.gid)
            },
            default: []
        },
        hasCamera() {
            return QrScanner.hasCamera()
        },
        tokenList: {
            async get(): Promise<M.TokenSpec[]> {
                const w = this.wallet
                if (!w) {
                    return []
                }
                const [tokens = [], activeSymbols = []] = await Promise.all(
                    [
                        this.$svc.config.token.all(),
                        this.$svc.config.token.activeSymbols()
                    ]
                )
                return tokens.filter(token => {
                    return token.gid === w.gid &&
                        (activeSymbols.includes(token.symbol) || token.permanent)
                })
            },
            default: []
        }
    },
    computed: {
        toWallets(): AddressGroup[] {
            let list = [...this.wallets.map<AddressGroup>(w => { return { name: w.meta.name, list: w.meta.addresses } })]
            if (this.recent.length) {
                list = [
                    {
                        name: this.$t('send.label_recent_transfer').toString(),
                        list: this.recent
                    },
                    ...list
                ]
            }
            return list
        },
        currentToken(): M.TokenSpec | undefined {
            return this.tokenList.find(item => item.symbol === this.symbol)
        },
        from(): string {
            return this.wallet ? this.wallet.meta.addresses[parseInt(this.i, 10)] : ''
        },
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[parseInt(this.i)] : ''
        }
    },
    methods: {
        isAddress: address.test,
        checkSumAddress(v: string): boolean {
            return !(v !== v.toLowerCase() && address.toChecksumed(v) !== v)
        },
        balanceCheck(v: string): boolean {
            const regexp = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,${this.currentToken!.decimals}})?$`)
            return regexp.test(v)
        },
        validate(): boolean {
            this.errors.to = this.isAddress(this.to)
                ? this.checkSumAddress(this.to) ? '' : this.$t('send.msg_checksum_failed').toString()
                : this.$t('send.msg_invalid_address').toString()

            this.errors.amount = this.balanceCheck(this.amount) ? '' : this.$t('send.msg_error_invalid_balance').toString()

            return (!this.errors.to && !this.errors.amount)
        },
        onClickScan() {
            this.$q.dialog({
                parent: this,
                component: QrScannerDialog
            }).onOk((addr: string) => {
                this.to = addr
            })
        },
        onSend() {
            if (!this.validate()) {
                return
            }
            let msgItem!: Connex.Vendor.TxMessage[0]
            let comment = ''
            if (this.symbol === 'VET') {
                comment = `${this.$t('common.transferring')} ${this.amount} VET`
                msgItem = {
                    to: this.to,
                    value: Vue.filter('toWei')(this.amount),
                    comment
                }
            } else {
                const func = new abi.Function(abis.transfer)
                comment = `${this.$t('common.transferring')} ${this.amount} ${this.symbol}`
                const data = func.encode(this.to,
                    Vue.filter('toWei')(this.amount, this.currentToken!.decimals))
                msgItem = {
                    to: this.currentToken!.address,
                    value: 0,
                    data: data,
                    comment
                }
            }
            this.$signTx(this.wallet!.gid, {
                message: [msgItem],
                options: {
                    signer: this.from,
                    comment: comment
                }
            }).then(() => {
                const temp = [this.to, ...this.recent].reduce((result: string[], cv: string) => {
                    !result.includes(cv.toLowerCase()) && result.push(cv.toLowerCase())
                    return result
                }, []).slice(0, 10)

                this.$svc.config.saveRecentRecipients(temp)
                this.$router.replace({ name: 'sign-success', query: { type: 'tx' } })
            })
        }
    }
})
</script>
