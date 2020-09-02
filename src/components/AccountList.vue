<template>
    <q-list>
        <template v-for="wallet in wallets">
            <q-item-label
                class="text-grey"
                :key="wallet.id"
            >{{wallet.meta.name}}</q-item-label>
            <q-expansion-item
                group="somegroup"
                v-for="address in wallet.meta.addresses"
                :key="address"
                expand-icon-toggle
                v-scrollIntoView="current === address"
                @before-show="toggleContent(address)"
            >
                <template v-slot:header>
                    <q-item-section
                        avatar
                        class="q-mr-none"
                        @click="$emit('change', address)"
                    >
                        <AddressAvatar
                            class="q-mx-auto"
                            style="width: 50px; height: 30px; border-radius: 5px;"
                            :addr="address"
                        />
                    </q-item-section>
                    <q-item-section
                        @click="$emit('change', address)"
                        class="monospace"
                        :class="{'text-primary': (current === address)}"
                    >
                        {{address | abbrev(8,6)}}
                    </q-item-section>
                </template>
                <slot :address="address" />
            </q-expansion-item>
        </template>
    </q-list>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    model: {
        prop: 'current',
        event: 'change'
    },
    props: {
        wallets: Array as () => M.Wallet[],
        current: String
    },
    methods: {
        toggleContent(address: string) {
            this.$emit('tabChange', address)
        }
    },
    directives: {
        scrollIntoView: {
            inserted(el, binding) {
                if (binding.value === true) {
                    el.scrollIntoView()
                }
            }
        }
    }
})
</script>
