<template>
    <div class="fit no-wrap">
        <div
            style="max-width: 500px"
            v-if="!txInfo"
            class="q-mx-auto"
        >
            <q-form
                class="q-px-md"
                @submit="onSend"
            >
                <q-input
                    no-error-icon
                    autocomplete="off"
                    clearable
                    :rules="[val => isAddress(val) || 'Please type a valid address']"
                    v-model.lazy="to"
                    label="To:"
                >
                    <template
                        v-if="isAddress(to)"
                        v-slot:prepend
                    >
                        <AddressAvatar
                            class="q-mx-auto"
                            style="width: 40px; height: 40px; border-radius: 20px;"
                            :addr="to"
                        />
                    </template>
                </q-input>
                <ConnexObject
                    v-slot="{connex}"
                    :node="node"
                >
                    <TokenSelector
                        v-model="symbol"
                        :connex="connex"
                        :address="from"
                        :tokens="tokenSpecs"
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
                    <connex-continuous
                        :key="symbol"
                        :connex="connex"
                        :query="() => query(connex)"
                        v-slot="{data}"
                    >
                        <div class="text-grey q-mt-sm">
                            <span>balance: {{data | balance(currentToken.decimals)}}</span>
                        </div>
                    </connex-continuous>
                </ConnexObject>
                <q-btn
                    type="submit"
                    class="full-width q-mt-xl"
                    color="blue-9"
                >Send</q-btn>
            </q-form>
        </div>
        <div
            class="q-px-md column fit"
            v-else
        >
            <div class=" text-center">
                <q-icon
                    size="50px"
                    name="check_circle_outline"
                    color="green"
                />
            </div>
            <div class=" text-center text-h6 q-mt-md">You've signed the Transaction</div>
            <div class=" text-center text-body2 text-grey q-my-md">It may take a while to see the transaction on the blockchain. You can always check the detail via activity</div>
            <q-list
                bordered
                class="rounded-borders"
            >
                <q-item>
                    <q-item-section avatar>
                        <q-item-label class="text-grey">TxID</q-item-label>
                    </q-item-section>

                    <q-item-section
                        style="word-break: break-all"
                        class="text-caption"
                    >
                        <span>
                            {{txInfo.id}}
                            <q-icon
                                @click="onCopy"
                                name="content_copy"
                            />
                        </span>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section avatar>
                        <q-item-label class="text-grey">Detail</q-item-label>
                    </q-item-section>

                    <q-item-section class="text-caption">
                        <q-item-label lines="1">{{txInfo.comment}}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>

            <q-btn
                class="q-mx-auto q-mt-auto q-mb-xl q-px-xl"
                color="blue-9"
                @click="$router.go(-1)"
                label="Done"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { tokenBalanceOf } from 'components/queries'
import { address, abi } from 'thor-devkit'
import { tokenSpecs, abis } from '../consts'
import { copyToClipboard } from 'quasar'

export default Vue.extend({
    props: {
        wId: String,
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
    computed: {
        wallet(): M.Wallet | undefined {
            return this.$state.wallet.list.find(i => {
                return i.id === parseInt(this.wId, 10)
            })
        },
        addressIndex(): number {
            return parseInt(this.i, 10)
        },
        gid(): string {
            return this.wallet!.gid
        },
        from(): string {
            return this.wallet!.meta.addresses[parseInt(this.i, 10)]
        },
        node(): M.Node {
            return this.$state.config.node.list.find(n => n.gid === this.gid)!
        },
        tokenSpecs(): M.TokenSpec[] {
            return [...this.$state.config.token.specs(this.gid, true)]
        },
        currentToken(): M.TokenSpec | undefined {
            if (this.symbol === 'VET') {
                return tokenSpecs.VET
            } else if (this.symbol === 'VTHO') {
                return tokenSpecs.VTHO
            } else {
                return this.tokenSpecs.find(item => this.symbol === item.symbol)
            }
        },
        balanceCheck(): (v: string) => boolean | string {
            const regexp = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,${this.currentToken!.decimals}})?$`)
            return (val) => {
                return regexp.test(val) || 'Invalide balance'
            }
        },
        query(): (connex: Connex) => Promise<string> {
            if (['VET', 'VTHO'].includes(this.symbol)) {
                return async (connex: Connex) => {
                    const account = await connex.thor.account(this.from).get()
                    return this.symbol === 'VET' ? account.balance : account.energy
                }
            } else {
                return (connex: Connex) => {
                    return this.tokenBalanceOf(connex, this.from, this.currentToken!)
                }
            }
        }
    },
    methods: {
        isAddress: address.test,
        tokenBalanceOf,
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
                    Vue.filter('toWei')(this.amount, this.currentToken!.decimals))
                msgItem = {
                    to: this.currentToken!.address,
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
