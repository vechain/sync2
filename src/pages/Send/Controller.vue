<template>
    <div
        class="column fit"
        v-if="tokenList.length"
    >
        <page-toolbar :title="$t('send.title')" />
        <div class="col no-wrap">
            <div
                style="max-width: 500px"
                class="q-mx-auto"
            >
                <q-form
                    class="q-px-md"
                    @submit="onSend"
                >
                    <To
                        no-error-icon
                        autocomplete="off"
                        clearable
                        v-model="to"
                        :wallets="toWallets"
                        :label="$t('send.label_to')"
                    />

                    <TokenSelector
                        :tokens="tokenList"
                        v-model="symbol"
                        :address="address"
                    />
                    <q-input
                        no-error-icon
                        autocomplete="off"
                        clearable
                        v-model="amount"
                        type="text"
                        :rules="[balanceCheck]"
                        inputmode="decimal"
                        :label="$t('send.label_amount')"
                    />
                    <async-resolve
                        v-if="currentToken"
                        :promise="$svc.bc(currentToken.gid).balanceOf(address, currentToken)"
                        v-slot="{data}"
                    >
                        <div class="text-grey q-mt-sm">
                            <span>{{$t('send.label_balance')}} {{data | balance(currentToken.decimals)}}</span>
                        </div>
                    </async-resolve>
                    <div class="row justify-center q-mt-xl">
                        <q-btn
                            type="submit"
                            unelevated
                            class="col-6 col-sm-auto"
                            color="blue-9"
                            :label="$t('send.action_proceed')"
                        />
                    </div>
                </q-form>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { abi } from 'thor-devkit'
import { abis } from 'src/consts'
import To from './To.vue'
import TokenSelector from './TokenSelector.vue'
import { AddressGroup } from './models'
import AsyncResolve from 'components/AsyncResolve'
import PageToolbar from 'components/PageToolbar.vue'

export default Vue.extend({
    components: {
        To,
        TokenSelector,
        AsyncResolve,
        PageToolbar
    },
    props: {
        wid: String,
        i: String,
        defaultSymbol: String
    },
    data() {
        return {
            to: '',
            amount: '',
            symbol: this.defaultSymbol || 'VET'
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
        balanceCheck(): (v: string) => boolean | string {
            const regexp = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,${this.currentToken!.decimals}})?$`)
            return (val) => {
                return regexp.test(val) || this.$t('send.msg_error_invalid_balance').toString()
            }
        },
        address(): string {
            return this.wallet ? this.wallet.meta.addresses[parseInt(this.i)] : ''
        }
    },
    methods: {
        onSend() {
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
