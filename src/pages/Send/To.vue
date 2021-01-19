<template>
    <q-input
        outlined
        no-error-icon
        autocomplete="off"
        v-bind="$attrs"
        dense
        placeholder="0x"
        clearable
        v-model.lazy="to"
        spellcheck="false"
    >
        <template
            v-if="isAddress(to)"
            v-slot:prepend
        >
            <AddressAvatar :addr="to" />
        </template>
        <template v-slot:append>
            <q-btn
                v-show="hasCamera && !to"
                rounded
                dense
                icon="qr_code_scanner"
                flat
                @click.stop="onClickScan"
            />
        </template>
        <q-popup-proxy
            position="bottom"
            fit
        >
            <q-card>
                <q-list padding>
                    <template v-for="(group, gi) in wallets">
                        <q-item-label
                            :key="gi"
                            header
                        >
                            {{group.name}}
                        </q-item-label>
                        <template v-for="(addr, ai) in group.list">
                            <AddressItem
                                clickable
                                v-close-popup
                                @click="onSelectAddress(addr)"
                                :key="`${gi} + ${ai}`"
                                :address="addr"
                            />
                        </template>
                    </template>
                </q-list>
            </q-card>
        </q-popup-proxy>
    </q-input>
</template>
<script lang="ts">
import Vue from 'vue'
import { address } from 'thor-devkit'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import { AddressGroup } from './models'
import AddressItem from './AddressItem.vue'
import QrScannerDialog from 'pages/QrScannerDialog'
import { QrScanner } from 'src/utils/qr-scanner'

export default Vue.extend({
    components: {
        AddressAvatar,
        AddressItem
    },
    model: {
        prop: 'address',
        event: 'change'
    },
    props: {
        wallets: {
            type: Array as () => AddressGroup[],
            default: []
        },
        address: String
    },
    data() {
        return {
            to: this.address
        }
    },
    asyncComputed: {
        hasCamera() { return QrScanner.hasCamera() }
    },
    watch: {
        address(v: string) {
            this.to = v
        },
        to(v: string) {
            this.$emit('change', v)
        }
    },
    methods: {
        isAddress: address.test,
        onSelectAddress(addr: string) {
            this.to = address.toChecksumed(addr)
        },
        async onClickScan() {
            try {
                this.to = await this.$dialog<string>({ component: QrScannerDialog })
            } catch { }
        }
    }
})
</script>
