<template>
    <q-btn
        v-bind="$attrs"
        @click="show = true"
    >
        <q-popup-proxy
            v-model="show"
            position="bottom"
            no-parent-event
            breakpoint="2000"
            :context-menu="false"
        >
            <q-card class="column full-width no-wrap">
                <q-toolbar>
                    <q-toolbar-title>Select</q-toolbar-title>
                </q-toolbar>
                <q-card-section
                    v-scrollDivider
                    class="col overflow-auto q-pt-none"
                >
                    <q-list>
                        <template v-for="group in groups">
                            <template v-if="group.addresses.length">
                                <q-item-label
                                    header
                                    :key="group.id"
                                >
                                    {{group.name}}
                                </q-item-label>
                                <template v-for="addr in group.addresses">
                                    <AddressInfo
                                        clickable
                                        dense
                                        @click="onClick(addr)"
                                        :key="group.id + addr"
                                        :address="addr"
                                    />
                                    <q-separator
                                        :key="'s' + group.id + addr"
                                        class="q-my-sm"
                                        inset="item"
                                    />
                                </template>
                            </template>
                        </template>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-popup-proxy>
    </q-btn>
</template>
<script lang="ts">
import Vue from 'vue'
export type Group = {
    name: string
    id: string | number
    addresses: string[]
}

export default Vue.extend({
    props: {
        groups: {
            type: Array as () => Group[],
            default: () => []
        }
    },
    data() {
        return {
            show: false
        }
    },
    methods: {
        onClick(addr: string) {
            this.show = false
            this.$emit('change', addr)
        }
    }
})
</script>
