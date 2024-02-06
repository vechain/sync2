<template>
    <q-input
        outlined
        no-error-icon
        autocomplete="off"
        v-bind="$attrs"
        dense
        placeholder="0x"
        clearable
        v-model.lazy="input"
        spellcheck="false"
        :hint="resolvedHint"
    >
        <template v-if="isAddress(to)" v-slot:prepend>
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
        <q-popup-proxy :no-parent-event="!!to" position="bottom" fit>
            <q-card>
                <q-list padding>
                    <template v-for="(group, gi) in wallets">
                        <q-item-label :key="gi" header>
                            {{ group.name }}
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
        address: String,
        gid: String
    },
    data() {
        return {
            input: this.address,
            resolvedName: '',
            resolvedAddress: ''
        }
    },
    computed: {
        to(): string {
            return this.resolvedAddress || this.input
        },
        resolvedHint(): string {
            if (this.resolvedName) {
                return this.resolvedName
            } else if (this.resolvedAddress) {
                return this.resolvedAddress
            } else {
                return ''
            }
        }
    },
    asyncComputed: {
        hasCamera() {
            if (process.env.MODE === 'cordova') {
                // assume all mobile devices have camera
                return Promise.resolve(true)
            } else {
                return QrScanner.hasCamera()
            }
        },
        resolvedAddress: {
            async get(): Promise<string> {
                if (!this.input || !this.input.includes('.') || !this.gid) {
                    return ''
                }

                const [address] = await this.$svc.bc(this.gid).vetDomainsAddressesOf([this.input])
                if (!address || address === '0x0000000000000000000000000000000000000000') {
                    return ''
                }

                return address
            },
            default: ''
        },
        resolvedName: {
            async get(): Promise<string> {
                if (!this.input || !this.isAddress(this.input) || !this.gid) {
                    return ''
                }

                const [name] = await this.$svc.bc(this.gid).vetDomainsNamesOf([this.input])
                if (!name || name === '') {
                    return ''
                }

                return name
            },
            default: ''
        }
    },
    watch: {
        address(v: string) {
            if (v === this.resolvedAddress) {
                return
            }
            this.input = v
        },
        to(v: string) {
            this.$emit('change', v)
        }
    },
    methods: {
        isAddress: address.test,
        onSelectAddress(addr: string) {
            this.input = address.toChecksumed(addr)
        },
        async onClickScan() {
            try {
                this.input = await this.$dialog<string>({ component: QrScannerDialog })
            } catch { }
        }
    }
})
</script>
