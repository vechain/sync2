<template>
    <q-list>
        <template v-for="wallet in wallets">
            <q-item-label
                class="text-grey"
                :key="wallet.id"
            >{{wallet.meta.name}}</q-item-label>
            <q-expansion-item
                group="somegroup"
                v-for="account in wallet.meta.addresses"
                :key="account"
                expand-icon-toggle
                @before-show="toggleContent(account)"
            >
                <template v-slot:header>
                    <q-item-section
                        avatar
                        class="q-mr-none"
                        @click="$emit('change', account)"
                    >
                        <AddressAvatar
                            class="q-mx-auto"
                            style="width: 50px; height: 30px; border-radius: 5px;"
                            :addr="account"
                        />
                    </q-item-section>
                    <q-item-section
                        @click="$emit('change', account)"
                        class="monospace"
                        :class="{'text-primary': (current === account)}"
                    >
                        {{account | abbrev(8)}}
                    </q-item-section>
                </template>
                <slot :account="account" />
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
        toggleContent(account: string) {
            this.$emit('tabChange', account)
        }
    }
})
</script>
