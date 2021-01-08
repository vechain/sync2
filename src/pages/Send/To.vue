<template>
    <q-input
        outlined
        no-error-icon
        autocomplete="off"
        v-bind="$attrs"
        dense
        :placeholder="$t('send.msg_recipient_placeholder')"
        clearable
        v-model.lazy="to"
    >
        <template
            v-if="isAddress(to)"
            v-slot:prepend
        >
            <AddressAvatar :addr="to" />
        </template>
        <template
            v-slot:append
        >
            <q-btn
                v-show="!to"
                rounded
                dense
                flat
                icon="mdi-plus-circle-outline"
            />
            <q-popup-proxy position="bottom" fit>
                <q-card>
                    <q-list padding>
                        <template v-for="(group, gi) in wallets">
                            <q-item-label :key="gi" header>
                                {{group.name}}
                            </q-item-label>
                            <template v-for="(addr, ai) in group.list">
                                <AddressItem
                                    clickable
                                    v-close-popup
                                    @click="onAddressChange(addr)"
                                    :key="`${gi} + ${ai}`"
                                    :address="addr"
                                />
                            </template>
                        </template>
                    </q-list>
                </q-card>
            </q-popup-proxy>
        </template>
    </q-input>
</template>
<script lang="ts">
import Vue from 'vue'
import { address } from 'thor-devkit'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import { AddressGroup } from './models'
import AddressItem from './AddressItem.vue'

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
    watch: {
        address(v: string) {
            this.to = v ? address.toChecksumed(v) : ''
        },
        to(v: string) {
            this.$emit('change', v)
        }
    },
    methods: {
        isAddress: address.test,
        onAddressChange(addr: string) {
            this.to = address.toChecksumed(addr)
        }
    }
})
</script>
