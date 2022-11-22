<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">Clause · {{index+1}}</q-toolbar-title>
            </q-toolbar>
            <q-list padding>
                <template v-if="clause.comment">
                    <q-item>
                        <q-item-section>
                            <q-item-label caption>Comment</q-item-label>
                            <q-item-label>{{clause.comment}}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-separator inset />
                </template>
                <q-item>
                    <q-item-section>
                        <q-item-label caption>To</q-item-label>
                        <q-item-label style="word-break:break-all">
                            <address-label
                                :addr="clause.to"
                                full
                            >null</address-label>
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-item-label caption>Value (wei)</q-item-label>
                        <q-item-label>
                            <amount-label
                                :value="clause.value"
                                :fixed="0"
                            />
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-item-label caption>Data</q-item-label>
                        <q-item-label>
                            <q-input
                                v-if="clause.data && clause.data.length > 2"
                                dense
                                class="monospace"
                                type="textarea"
                                standout
                                readonly
                                :value="clause.data"
                            />
                            <template v-else>N/A</template>
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item v-if="decodedData">
                    <q-item-section>
                        <q-item-label>
                            <q-input
                                dense
                                class="monospace"
                                type="textarea"
                                standout
                                readonly
                                :value="decodedData"
                            />
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import AddressLabel from 'src/components/AddressLabel.vue'
import AmountLabel from 'src/components/AmountLabel.vue'
import { abi } from 'thor-devkit'
import axios from 'axios'

export default Vue.extend({
    components: { AddressLabel, AmountLabel },
    props: {
        index: Number,
        clause: Object as () => Connex.Vendor.TxMessage[0]
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() }
    },
    asyncComputed: {
        async decodedData(): Promise<string | null> {
            if (!this.clause.data || this.clause.data.length <= 2) {
                return null
            }

            const signature = this.clause.data.slice(0, 10)
            const data = this.clause.data.slice(10)

            try {
                const response = await axios.get(`https://b32.vecha.in/q/${signature}.json`, { transformResponse: data => data, timeout: 3 * 1000 })
                const abis = JSON.parse(response.data)

                // try to decode each abi, it may fail on signature collision
                // return first match
                for (const abiItem of abis) {
                    try {
                        const decodedData = abi.decodeParameters(abiItem.inputs, `0x${data}`)
                        const readableInputs = abiItem.inputs.map((input: abi.Function.Definition, index: number) => `(${input.type}) ${input.name} ${decodedData[input.name || String(index)]}`)
                        return `${abiItem.name} (\n${readableInputs.map((line: string) => `  ${line}`).join(', \n')}\n)`
                    } catch {}
                }
            } catch {}

            return null
        }
    }
})
</script>
