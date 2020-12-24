<template>
    <q-btn v-bind="$attrs">
        <pop-sheets
            fit
            :sheets="sheets"
            customized
        >
            <template v-slot="{sheet: {model: group}}">
                <q-item-label header>
                    {{group.name}}
                </q-item-label>
                <template v-for="(addr, i) in group.list">
                    <AddressItem
                        clickable
                        v-close-popup
                        dense
                        @click="onClick(addr)"
                        :key="i"
                        :address="addr"
                    />
                    <q-separator
                        v-if="i !== (group.list.length - 1)"
                        :key="`s-${i}`"
                        class="q-my-sm"
                        inset="item"
                    />
                </template>
            </template>
        </pop-sheets>
    </q-btn>
</template>
<script lang="ts">
import Vue from 'vue'
import { AddressGroup } from './models'
import AddressItem from './AddressItem.vue'
import PopSheets, { Sheet } from 'src/components/PopSheets.vue'

export default Vue.extend({
    components: {
        PopSheets,
        AddressItem
    },
    props: {
        groups: {
            type: Array as () => AddressGroup[],
            default: () => []
        }
    },
    computed: {
        sheets(): Sheet<AddressGroup>[] {
            return this.groups.map<Sheet<AddressGroup>>(g => {
                return {
                    label: '',
                    action: () => { },
                    model: g
                }
            })
        }
    },
    methods: {
        onClick(addr: string) {
            this.$emit('change', addr)
        }
    }
})
</script>
