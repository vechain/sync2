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
                        <q-tabs breakpoint="350" class="text-grey" active-color="primary" align="left" dense v-model="dataPanel" no-caps>
                            <q-tab default name="data" label="Data" />
                            <q-tab name="decoded" label="Decoded" />
                            <q-tab name="utf-8" label="UTF-8" />
                        </q-tabs>
                        <q-tab-panels animated v-model="dataPanel">
                            <q-tab-panel name="data">
                                <q-input
                                    square
                                    v-if="clause.data && clause.data.length > 2"
                                    dense
                                    class="monospace"
                                    type="textarea"
                                    :input-style="{height: '146px'}"
                                    standout
                                    readonly
                                    :value="clause.data"
                                />
                                <template v-else>N/A</template>
                            </q-tab-panel>
                            <q-tab-panel name="decoded">
                                <div v-if="decodedObject"
                                    class="monospace q-pa-sm tab-content" >
                                    <strong>function {{decodedObject.name}}({{ decodedObject.params.map(i => i.name + ': ' +i.type).join(', ') }})</strong>
                                    <div class="q-pt-xs" v-for="p in decodedObject.params" :key="p.name + p.value">
                                        <span class="text-grey-7">{{p.name}}: </span>
                                        <span>{{p.value}}</span>
                                    </div>
                                </div>
                                <template v-else>Unable to decode data</template>
                            </q-tab-panel>
                            <q-tab-panel name="utf-8">
                                <div class="monospace q-pa-sm tab-content"
                                    v-if="decodedString">{{decodedString}}</div>
                                <template v-else>N/A</template>
                            </q-tab-panel>
                        </q-tab-panels>
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

async function queryAbi(signature: string): Promise<abi.Function.Definition | null> {
    let abi = JSON.parse(localStorage.getItem(signature) || 'null')
    if (!abi) {
        try {
            const response = await axios.get(`https://b32.vecha.in/q/${signature}.json`, { timeout: 3 * 1000 })
            const abis = response.data
            localStorage.setItem(signature, JSON.stringify(abis[0]))
            abi = abis[0]
        } catch (error) {
            console.error(error)
            abi = null
        }
    }

    return abi
}

export default Vue.extend({
    components: { AddressLabel, AmountLabel },
    props: {
        index: Number,
        clause: Object as () => Connex.Vendor.TxMessage[0]
    },
    data() {
        return {
            dataPanel: 'data' as 'data' | 'decoded' | 'utf-8'
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },
        decodeDataToReadable(abiItem: abi.Function.Definition, data: string) {
            const decodedData = abi.decodeParameters(abiItem.inputs, `0x${data}`)
            return {
                name: abiItem.name,
                params: abiItem.inputs.map((p, i) => {
                    return {
                        name: p.name,
                        type: p.type,
                        value: decodedData[i]
                    }
                })
            }
        }
    },
    asyncComputed: {
        async decodedObject(): Promise<any | null> {
            if (!this.clause.data || this.clause.data.length <= 10) {
                return null
            }

            const signature = this.clause.data.slice(0, 10)
            const data = this.clause.data.slice(10)

            if (this.clause.abi) {
                try {
                    return this.decodeDataToReadable(this.clause.abi as abi.Function.Definition, data)
                } catch (e) { console.log(e) }
            }

            // double check
            const abiItem = await queryAbi(signature)
            if (abiItem) {
                try {
                    return this.decodeDataToReadable(abiItem, data)
                } catch (e) { console.log(e) }
            }

            return null
        }
    },
    computed: {
        decodedString() {
            if (!this.clause.data || this.clause.data.length <= 2) {
                return null
            }

            return Buffer.from(this.clause.data.slice(2), 'hex').toString('utf-8')
        }
    }
})
</script>
<style>
.tab-content {
    width: 100%;
    white-space: break-spaces;
    word-break: break-all;
    font-size: 14px;
    height: 150px;
    overflow: auto;
    background-color: #0000000d;
    border: 1px dashed #b8b8b8;
}
</style>
