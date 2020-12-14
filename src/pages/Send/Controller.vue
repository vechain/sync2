<template>
    <div
        class="column fit"
        v-if="tokenList.length"
    >
        <page-toolbar title="Send" />
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
                        :rules="[val => isAddress(val) || 'Please enter a valid address']"
                        v-model="to"
                        :wallets="toWallets"
                        label="To"
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
                        label="Amount"
                    />
                    <Resolve
                        :promise="$svc.bc(currentToken.gid).balanceOf(address, currentToken)"
                        v-slot="{data}"
                    >
                        <div class="text-grey q-mt-sm">
                            <span>Balance: {{data | balance(currentToken.decimals)}}</span>
                        </div>
                    </Resolve>
                    <div class="row justify-center q-mt-xl">
                        <q-btn
                            type="submit"
                            unelevated
                            class="col-6 col-sm-auto"
                            color="blue-9"
                            label="Send"
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
import { copyToClipboard } from 'quasar'
import To from './To.vue'
import TokenSelector from './TokenSelector.vue'
import { AddressGroup } from './models'

export default Vue.extend({
    components: {
        To,
        TokenSelector
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
            symbol: this.defaultSymbol || 'VET',
            amountError: '',
            txInfo: null as unknown as { id: string, comment: string }
        }
    },
    asyncComputed: {
        wallet(): Promise<M.Wallet | null> {
            return this.$svc.wallet.get(parseInt(this.wid))
        },
        toWallets: {
            async get(): Promise<AddressGroup[]> {
                if (!this.wallet) {
                    return []
                }

                const [wallets, recent] = await Promise.all([
                    this.$svc.wallet.getByGid(this.wallet.gid),
                    this.$svc.config.getRecentRecipients()
                ])
                return [{
                    name: 'Recent',
                    addresses: recent
                },
                ...wallets.map<AddressGroup>(w => {
                    return {
                        name: w.meta.name,
                        addresses: w.meta.addresses
                    }
                })]
            },
            default: []
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
                return tokens.filter(token => {
                    return token.gid === w.gid &&
                        (activeSymbols.includes(token.symbol) || token.permanent)
                })
            },
            default: []
        }
    },
    computed: {
        currentToken(): M.TokenSpec {
            return this.tokenList.find(item => item.symbol === this.symbol)
        },
        from(): string {
            return this.wallet!.meta.addresses[parseInt(this.i, 10)]
        },
        balanceCheck(): (v: string) => boolean | string {
            const regexp = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,${this.currentToken.decimals}})?$`)
            return (val) => {
                return regexp.test(val) || 'Invalide balance'
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
                comment = `Transferring ${this.amount} VET`
                msgItem = {
                    to: this.to,
                    value: Vue.filter('toWei')(this.amount),
                    comment
                }
            } else {
                const func = new abi.Function(abis.transfer)
                comment = `Transferring ${this.amount} ${this.symbol}`
                const data = func.encode(this.to,
                    Vue.filter('toWei')(this.amount, this.currentToken.decimals))
                msgItem = {
                    to: this.currentToken.address,
                    value: 0,
                    data: data,
                    comment
                }
            }
            this.$signTx(this.gid, {
                message: [msgItem],
                options: {
                    signer: this.from,
                    comment: comment
                }
            }).then((r) => {
                this.txInfo = {
                    id: r.txid,
                    comment: comment
                }
                const temp = [this.to, ...this.recentList].reduce((result: string[], cv: string) => {
                    !result.includes(cv.toLowerCase()) && result.push(cv.toLowerCase())
                    return result
                }, []).slice(0, 10)

                this.$svc.config.saveRecentRecipients(temp)
            })
        },
        onCopy() {
            copyToClipboard(this.txInfo.id).then(
                () => {
                    this.$q.notify('copied')
                }
            ).catch(console.error)
        }
    }
})
</script>
