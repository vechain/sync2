<template>
    <q-page v-if="wallet">
        <q-item class="q-px-lg">
            <q-item-section>
                <span class="text-h6">{{wallet.meta.name}}</span>
            </q-item-section>
            <q-item-section side>
                <q-btn
                    color="white"
                    text-color="black"
                    flat
                    dense
                    round
                    icon="more_horiz"
                    aria-label="More"
                    @click="showMenu = !showMenu"
                >
                    <q-menu v-show="false">
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
            </q-item-section>
        </q-item>
        <SlideContainer
            :count="addresses.length"
            v-slot="{index, active}"
            v-model="current"
        >
            <div
                v-if="active"
                class="row justify-center q-my-sm"
            >
                <AddressCard
                    class="col-10"
                    :addressItem="addresses[index]"
                />
            </div>
        </SlideContainer>
        <q-separator />
        <ConnexObject
            :node="{gid: wallet.gid, url: 'http://localhost:8080/main'}"
            v-slot="{connex}"
        >
            <ConnexContinuous
                :connex="connex"
                :query="()=> query(connex)"
                v-slot="{data}"
            >
                <Tokens
                    :list="list"
                    :balances="data"
                />
            </ConnexContinuous>
        </ConnexObject>
        <q-separator />
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
import BigNumber from 'bignumber.js'
type TokenBaseInfo = { symbol: string, balance: string, decimals: number, name: string }
export default Vue.extend({
    data() {
        return {
            showMenu: false,
            current: 0,
            balanceOfAbi: {
                constant: true,
                inputs: [
                    {
                        name: '_owner',
                        type: 'address'
                    }
                ],
                name: 'balanceOf',
                outputs: [
                    {
                        name: 'balance',
                        type: 'uint256'
                    }
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function'
            }
        }
    },
    computed: {
        wallet() {
            return this.$state.wallet.current
        },
        tokens() {
            return this.$state.config.token.getList(this.$state.wallet.current.gid)
        },
        list() {
            return [{ name: 'VeChain Token', symbol: 'VET' }, ...this.$state.config.token.getList(this.$state.wallet.current.gid)]
        },
        addresses() {
            return this.$state.wallet.current.meta.addresses.filter(item => item.visible)
        }
    },
    methods: {
        async query(connex: Connex) {
            const addr = this.wallet.meta.addresses[this.current].address
            const account = await connex.thor.account(addr).get()
            const tokenMethods = this.tokens.filter(item => {
                return item.symbol !== 'VTHO'
            }).map(item => {
                return {
                    balanceOf: (addr: string) => {
                        return connex.thor
                            .account(item.address)
                            .method(this.balanceOfAbi)
                            .cache([addr])
                            .call(addr)
                    },
                    symbol: item.symbol,
                    decimals: item.decimals,
                    name: item.name
                }
            })
            const getBalance = () => {
                return {
                    symbol: 'VET',
                    balance: account.balance,
                    decimals: 18,
                    name: 'VeChain Token'
                }
            }
            const getEnergy = () => {
                return {
                    symbol: 'VTHO',
                    balance: account.energy,
                    decimals: 18,
                    name: 'VeChain Thor'
                }
            }

            const getTokenBalance = async () => {
                const result: TokenBaseInfo[] = []
                for (const item of tokenMethods) {
                    const temp = await item.balanceOf(addr)
                    result.push({
                        symbol: item.symbol,
                        name: item.name,
                        balance: temp.decoded!.balance,
                        decimals: item.decimals
                    })
                }

                return result
            }
            const tokenBalances: TokenBaseInfo[] = await getTokenBalance()

            const result: Record<string, number> = {}
            const temp = [getBalance(), getEnergy(), ...tokenBalances]
            temp.forEach(item => {
                result[item.symbol] =
                    (() => {
                        const temp = new BigNumber(item.balance)
                        return temp.isGreaterThan(0)
                            ? temp.div(new BigNumber('1e+' + (item.decimals))).toNumber()
                            : 0
                    })()
            })

            return result
        }
    }
})
</script>
