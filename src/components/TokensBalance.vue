<template>
    <ConnexContinuous
        :connex="connex"
        :query="()=> query(connex)"
        v-slot="{data: balances}"
    >
        <slot
            :balances="balances"
        >
        </slot>
    </ConnexContinuous>
</template>

<script lang="ts">
import Vue from 'vue'

const Abi = {
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

export default Vue.extend({
    props: {
        connex: Object as () => Connex,
        list: Array as () => { name: string, symbol: string }[],
        tokens: Array as () => M.Token[],
        address: String
    },
    methods: {
        async query(connex: Connex) {
            const account = await connex.thor.account(this.address).get()
            const tokenMethods = this.tokens.filter(item => {
                return item.symbol !== 'VTHO'
            }).map(item => {
                return {
                    balanceOf: (addr: string) => {
                        return connex.thor
                            .account(item.address)
                            .method(Abi)
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
                const result: M.TokenBaseInfo[] = []
                for (const item of tokenMethods) {
                    const temp = await item.balanceOf(this.address)
                    result.push({
                        symbol: item.symbol,
                        name: item.name,
                        balance: temp.decoded!.balance,
                        decimals: item.decimals
                    })
                }

                return result
            }
            const tokenBalances: M.TokenBaseInfo[] = await getTokenBalance()

            const result: Record<string, M.TokenBaseInfo> = {}
            const temp = [getBalance(), getEnergy(), ...tokenBalances]
            temp.forEach(item => {
                result[item.symbol] = item
            })

            return result
        }
    }
})
</script>
