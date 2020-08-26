<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <q-toolbar>
                <q-btn
                    flat
                    round
                    dense
                    @click="hide"
                    icon="close"
                />
                <q-toolbar-title class="absolute-center text-capitalize">
                    Send Assets
                </q-toolbar-title>
            </q-toolbar>
            <div
                style="max-width: 500px"
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
                        v-model="to"
                        label="To:"
                    />
                    <ConnexObject
                        v-slot="{connex}"
                        :node="node"
                    >
                        <TokenSelector v-model="symbol" :connex="connex" :address="from" :tokens="tokenSpecs"/>
                        <q-input
                            no-error-icon
                            autocomplete="off"
                            clearable
                            v-model="total"
                            type="text"
                            :rules="[balanceCheck]"
                            inputmode="decimal"
                            :label="symbol"
                        />

                        <connex-continuous
                            :key="symbol"
                            :connex="connex"
                            :query="() => query(connex)"
                            v-slot="{data}"
                        >
                            <div class="text-center text-grey q-mt-sm">
                                <span>balance: {{data | balance(currentToken.decimals)}}</span>
                            </div>
                        </connex-continuous>
                    </ConnexObject>
                    <q-btn
                        type="submit"
                        class="full-width q-mt-xl"
                        dark
                    >Send</q-btn>
                </q-form>
            </div>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import { tokenBalanceOf } from 'components/queries'
import { isAddress } from 'thor-devkit/dist/cry/address'
import { abi } from 'thor-devkit/dist/abi'
import { tokenSpecs, abis } from '../consts'

export default Vue.extend({
    props: {
        from: String,
        gid: String,
        defaultSymbol: String
    },
    data() {
        return {
            to: '',
            total: '',
            symbol: this.defaultSymbol || 'VET'
        }
    },
    computed: {
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
        isAddress,
        tokenBalanceOf,
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        },
        onSend() {
            let msgItem!: Connex.Vendor.TxMessage[0]
            if (this.symbol === 'VET') {
                msgItem = {
                    to: this.to,
                    value: Vue.filter('toWei')(this.total),
                    comment: `Transferring ${this.total} VET`
                }
            } else {
                const func = new abi.Function(abis.transfer)
                const data = func.encode(this.to,
                    Vue.filter('toWei')(this.total, this.currentToken!.decimals))
                msgItem = {
                    to: this.currentToken!.address,
                    value: 0,
                    data: data,
                    comment: `Transferring ${this.total} ${this.symbol}`
                }
            }

            this.$signTx(this.gid, {
                message: [msgItem],
                options: {
                    signer: this.from
                }
            })
        }
    }
})
</script>
