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
    >
        <template
            v-if="isAddress(to)"
            v-slot:prepend
        >
            <AddressAvatar :addr="to" />
        </template>
        <template
            v-if="!to"
            v-slot:append
        >
            <q-btn
                rounded
                dense
                flat
                icon="add"
            />
            <pop-sheets
                fit
                :sheets="sheets"
            >
                <template v-slot="{sheet: {model: group}}">
                    <q-item-label header>
                        {{group.name}}
                    </q-item-label>
                    <template v-for="(addr, i) in group.list">
                        <AddressItem
                            clickable
                            v-close-popup
                            @click="onAddressChange(addr)"
                            :key="i"
                            :address="addr"
                        />
                    </template>
                </template>
            </pop-sheets>
        </template>
    </q-input>
</template>
<script lang="ts">
import Vue from 'vue'
import { address } from 'thor-devkit'
import AddressAvatar from 'src/components/AddressAvatar.vue'
import { AddressGroup } from './models'
import AddressItem from './AddressItem.vue'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'

export default Vue.extend({
    components: {
        AddressAvatar,
        AddressItem,
        PopSheets
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
        to(v: string) {
            this.$emit('change', v)
        }
    },
    computed: {
        sheets(): Sheet<AddressGroup>[] {
            return this.wallets.map<Sheet<AddressGroup>>(g => {
                return {
                    label: '',
                    action: () => { },
                    model: g
                }
            })
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
