<template>
    <q-card
        flat
        bordered
    >
        <q-card-section>
            <!-- to infos -->
            <div>
                <template v-if="!isCreate">
                    <div class="row justify-between">
                        <span class="col-2 text-subtitle2 text-grey">To</span>
                        <span class="col-4 text-subtitle2 text-right text-grey">
                            <slot />
                        </span>
                    </div>
                    <AddressAvatar
                        class="q-mx-auto"
                        style="width: 100px; height: 100px; border-radius: 50px;"
                        :addr="toAddr"
                    />
                    <div
                        class="q-px-lg q-pt-sm monospace text-center"
                        style="word-break: break-all;"
                        @click="isShort = !isShort"
                    >
                        <span v-if="isShort">
                            {{toAddr | checksum | abbrev(8, 6)}}
                        </span>
                        <span v-else>
                            {{toAddr | checksum}}
                        </span>
                        <q-icon
                            class="text-grey"
                            :name="isShort ? 'zoom_in' : 'zoom_out'"
                            size="sm"
                        />
                    </div>
                </template>
                <template v-else>
                    <div class="q-px-lg q-pt-sm text-center">
                        <q-icon
                            name="note_add"
                            size="100px"
                        />
                        <div>New Contract</div>
                    </div>
                </template>
            </div>
            <!-- amount infos -->
            <div>
                <span class="text-subtitle2 text-grey">Amount</span>
                <div>
                    <template v-if="isToken">
                        <TokenBalanceItem
                            class="q-px-xs"
                            v-if="!isZeroVet"
                            :balance="vet"
                            :token="tokenSpecs.VET"
                        />
                        <TokenBalanceItem
                            class="q-px-xs"
                            v-if="decoded"
                            :balance="decoded.value"
                            :token="token"
                        />
                    </template>
                    <template v-else>
                        <TokenBalanceItem
                            class="q-px-xs"
                            :balance="vet"
                            :token="tokenSpecs.VET"
                        />
                    </template>
                </div>
                <div class="q-my-xs text-body2 text-grey-7">{{msg.comment}}</div>
            </div>
            <!-- data infos -->
            <div v-if="msg.data">
                <q-expansion-item
                    v-model="expanded"
                    :label=" expanded ? 'Hide Details' : 'Show Details'"
                    header-class="text-light-blue-9 text-center text-body2"
                >
                    <span class="text-subtitle2 text-grey">Input Data</span>
                    <q-input
                        input-style="resize: none"
                        v-model="msg.data"
                        filled
                        readonly
                        type="textarea"
                    />
                </q-expansion-item>
            </div>
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { BigNumber } from 'bignumber.js'
import { abi } from 'thor-devkit'
import { abis, tokenSpecs } from '../consts'

export default Vue.extend({
    props: {
        tokens: Array as () => M.TokenSpec[],
        msg: Object as () => Connex.Vendor.TxMessage[0]
    },
    data() {
        return {
            expanded: false,
            isShort: true,
            tokenSpecs
        }
    },
    computed: {
        tokenAddressList(): string[] {
            return [
                ...this.tokens.map((t: M.TokenSpec) => {
                    return t.address
                })
            ]
        },
        isZeroVet(): boolean {
            return new BigNumber(this.msg.value).isZero()
        },
        vet(): string {
            return this.msg.value.toString()
        },
        toAddr(): string {
            let content = ''
            if (this.isVet) {
                content = this.msg.to || ''
            } else if (this.isToken) {
                content = this.decoded ? this.decoded.to : ''
            } else { }
            return content
        },
        token(): M.TokenSpec | undefined {
            if (this.isToken) {
                return this.tokens.find(item => {
                    return item.address === this.msg.to
                })
            } else {
                return undefined
            }
        },
        isToken(): boolean {
            return this.tokenAddressList.includes(this.msg.to || '')
        },
        isVet(): boolean {
            return !!this.msg.to && !!this.msg.value
        },
        decoded(): { to: string, value: string | number } | undefined {
            if (this.isToken && this.msg.data) {
                return this.tokenDecode(this.msg.data)
            } else {
                return undefined
            }
        },
        isCreate(): boolean {
            return !this.msg.to && !!this.msg.data
        }
    },
    methods: {
        tokenDecode(data: string): { to: string, value: string | number } | undefined {
            try {
                const params = abi.decodeParameters(abis.transfer.inputs, `0x${data.slice(10)}`)
                return {
                    to: params._to,
                    value: params._value
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
})
</script>
