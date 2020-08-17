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
                            {{isToken ? decoded.to : msg.to | checksum | abbrev(8)}}
                        </span>
                        <span v-else>
                            {{isToken ? decoded.to : msg.to | checksum}}
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
                        <q-item
                            v-if="val"
                            class="q-px-xs"
                        >
                            <q-item-section avatar>
                                <q-avatar
                                    color="primary"
                                    text-color="black"
                                > V </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>
                                    <span class="text-h4">
                                        {{val | balance(18)}}
                                    </span>
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item
                            v-if="decoded"
                            class="q-px-xs"
                        >
                            <q-item-section avatar>
                                <q-avatar
                                    color="primary"
                                    text-color="black"
                                >
                                    {{token.symbol.slice(0,1)}}
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>
                                    <span class="text-h4">
                                        {{ decoded.value | balance(token.decimals) }}
                                    </span>
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                    <template v-else>
                        <span class="text-h4">VET {{val | balance(18)}}</span>
                    </template>
                </div>
                <div class="q-my-xs text-body2 text-grey-7">{{msg.comment}}</div>
            </div>
            <!-- data infos -->
            <div
                v-if="msg.data"
            >
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
import { abi } from 'thor-devkit/dist/abi'
import { abis } from '../consts'

export default Vue.extend({
    props: {
        tokens: Array as () => M.TokenSpec[],
        msg: Object as () => Connex.Vendor.TxMessage[0]
    },
    data() {
        return {
            expanded: false,
            isShort: true
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
        val(): string {
            return new BigNumber(this.msg.value).isZero() ? '' : this.msg.value.toString()
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
