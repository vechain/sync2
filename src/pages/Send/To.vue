<template>
    <q-input
        no-error-icon
        autocomplete="off"
        v-bind="$attrs"
        clearable
        :rules="[val => isAddress(val) || $t('send.msg_invalid_address'), val => checkSumAddress(val) || $t('send.msg_checksum_failed') ]"
        v-model.lazy="to"
    >
        <template
            v-if="isAddress(to)"
            v-slot:prepend
        >
            <AddressAvatar :addr="to" />
        </template>
        <template v-slot:append>
            <q-btn
                v-if="hasCamera"
                rounded
                dense
                flat
                icon="qr_code_scanner"
                @click="onClickScan"
            />
            <AddressSelector
                rounded
                dense
                flat
                icon="add"
                :groups="wallets"
                @change="onAddressChange"
            />
        </template>
    </q-input>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressSelector from './AddressSelector.vue'
import { address } from 'thor-devkit'
import QrScannerDialog from 'pages/QrScannerDialog'
import { QrScanner } from 'src/utils/qr-scanner'
import { AddressGroup } from './models'
import AddressAvatar from 'src/components/AddressAvatar.vue'

export default Vue.extend({
    components: {
        AddressSelector,
        AddressAvatar
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
            to: this.address,
            hasCamera: undefined as unknown as boolean // type hack for async computed
        }
    },
    asyncComputed: {
        hasCamera() {
            return QrScanner.hasCamera()
        }
    },
    watch: {
        to(v: string) {
            this.$emit('change', v)
        }
    },
    methods: {
        onAddressChange(addr: string) {
            this.to = address.toChecksumed(addr)
        },
        isAddress: address.test,
        checkSumAddress(v: string) {
            return !(v !== v.toLowerCase() && address.toChecksumed(v) !== v)
        },
        onClickScan() {
            this.$q.dialog({
                component: QrScannerDialog
            }).onOk((addr: string) => {
                this.to = addr
            })
        }
    }
})
</script>
